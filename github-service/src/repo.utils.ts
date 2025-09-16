import * as fs from "fs/promises";
import simpleGit from "simple-git";
import * as path from "node:path";
import * as YAML from "yaml";

export async function cloneMonoRepoAndPushToTeamRepo(
    monoRepoUrl: string,
    monoRepoVersion: string,
    myCoreBotDockerImage: string,
    visualizerDockerImage: string,
    teamRepoUrl: string,
    decryptedGithubAccessToken: string,
    tempFolderPath: string,
    eventId: string,
) {
    this.logger.log(
        `Cloning mono repo ${monoRepoUrl} to temp folder ${tempFolderPath}`,
    );
    let git = simpleGit(tempFolderPath);
    await git.clone(monoRepoUrl, "./", ["--filter=blob:none", "--sparse"]);
    try {
        await git.fetch(["origin", `tag`, monoRepoVersion, "--no-tags"]);
    } catch (_) {
        this.logger.warn(`Failed to fetch tag ${monoRepoVersion}, using branch instead`);
    }
    await git.checkout(monoRepoVersion);
    await git.raw(["sparse-checkout", "set", this.MY_CORE_BOT_FOLDER]);

    await fs.rm(`${tempFolderPath}/.git`, { recursive: true, force: true });
    await fs.rm(`${tempFolderPath}/${this.MY_CORE_BOT_FOLDER}/.git`, {
        recursive: true,
        force: true,
    });

    git = simpleGit(path.join(tempFolderPath, this.MY_CORE_BOT_FOLDER));

    await git.init();

    await git.addRemote(
        "team-repo",
        teamRepoUrl.replace("https://", `https://${decryptedGithubAccessToken}@`),
    );

    // if .coreignore exists
    const coreignorePath = path.join(
        tempFolderPath,
        this.MY_CORE_BOT_FOLDER,
        this.COREIGNORE_FILE,
    );
    if (
        await fs
            .stat(coreignorePath)
            .then(() => true)
            .catch(() => false)
    ) {
        const coreIgnoreContent = await fs.readFile(coreignorePath, "utf-8");
        const gitignorePath = path.join(
            tempFolderPath,
            this.MY_CORE_BOT_FOLDER,
            ".gitignore",
        );
        await fs.writeFile(gitignorePath, coreIgnoreContent);
        await fs.rm(coreignorePath);
    }

    // Update devcontainer/docker-compose.yml image tags for my-core-bot and visualizer
    await updateDevcontainerDockerCompose(
        path.join(tempFolderPath, this.MY_CORE_BOT_FOLDER),
        myCoreBotDockerImage,
        visualizerDockerImage,
    );

    // await fs.writeFile(
    //   path.join(tempFolderPath, this.MY_CORE_BOT_FOLDER, "project.json"),
    //   JSON.stringify({
    //     eventId: eventId,
    //   }),
    // );

    await git.add(".");
    await git.commit("Initial commit");

    const branchInfo = await git.branch();
    if (!branchInfo.all.includes("main")) {
        await git.branch(["-M", "main"]);
    }
    await git.push("team-repo", "main", ["-u"]);
    this.logger.log(
        `Pushed to team-repo ${teamRepoUrl} from temp folder ${tempFolderPath}`,
    );
}

async function updateDevcontainerDockerCompose(
    repoRoot: string,
    myCoreBotDockerImage: string,
    visualizerDockerImage: string,
): Promise<void> {
    try {
        const composePath = path.join(
            repoRoot,
            ".devcontainer",
            "docker-compose.yml",
        );
        const exists = await fs
            .stat(composePath)
            .then(() => true)
            .catch(() => false);
        if (!exists) {
            this.logger.log(
                `No .devcontainer/docker-compose.yml found at ${composePath}, skipping image tag update`,
            );
            return;
        }

        const originalContent = await fs.readFile(composePath, "utf-8");

        const doc = YAML.parseDocument(originalContent);
        const services = doc.get("services");
        if (!services || typeof services !== "object") {
            this.logger.log(
                `No services section in ${composePath}, skipping image tag update`,
            );
            return;
        }

        if (YAML.isMap(services)) {
            for (const pair of services.items) {
                const serviceName = String(pair.key);
                const imageVal = doc.getIn([
                    "services",
                    serviceName,
                    "image",
                ]) as string | undefined;
                if (!imageVal || typeof imageVal !== "string") continue;

                if (serviceName === "my-core-bot") {
                    doc.setIn(["services", serviceName, "image"], myCoreBotDockerImage);
                    this.logger.log(
                        `Updated image for service ${serviceName} to ${myCoreBotDockerImage}`,
                    );
                } else if (serviceName === "visualizer") {
                    doc.setIn(["services", serviceName, "image"], visualizerDockerImage);
                    this.logger.log(
                        `Updated image for service ${serviceName} to ${visualizerDockerImage}`,
                    );
                }
            }
        }

        const updatedContent = doc.toString();
        await fs.writeFile(composePath, updatedContent);
        this.logger.log(
            `Updated devcontainer docker-compose image tags to ${myCoreBotDockerImage} and ${visualizerDockerImage} at ${composePath}`,
        );
    } catch (error) {
        this.logger.error(
            `Failed to update .devcontainer/docker-compose.yml image tags`,
            error as Error,
        );
    }
}
