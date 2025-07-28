package kube

import (
	"context"
	"crypto/rand"
	"fmt"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (c *Client) CreateGameJob(game *Game) error {
	var botIDs []string
	for ind := range game.Bots {
		id, err := generateRandomID(16)
		if err != nil {
			return fmt.Errorf("error generating rnd IDs for bots %w", err)
		}
		game.Bots[ind].RndID = &id
		botIDs = append(botIDs, id)
	}

	var volumes []corev1.Volume
	var initContainers []corev1.Container
	var botContainers []corev1.Container
	for _, bot := range game.Bots {
		volumeName := "shared-data-" + bot.ID.String()
		initContainerName := "clone-repo-" + bot.ID.String()
		containerName := "bot-" + bot.ID.String()

		volumes = append(volumes, corev1.Volume{
			Name: volumeName,
			VolumeSource: corev1.VolumeSource{
				EmptyDir: &corev1.EmptyDirVolumeSource{},
			},
		})

		initContainers = append(initContainers, corev1.Container{
			Name:  initContainerName,
			Image: "alpine/git",
			Command: []string{
				"sh", "-c", fmt.Sprintf("git clone --single-branch --depth 1 %s /shared-data/repo", bot.RepoURL),
			},
			VolumeMounts: []corev1.VolumeMount{
				{
					Name:      volumeName,
					MountPath: "/shared-data",
				},
			},
		})

		botContainers = append(botContainers, corev1.Container{
			Name:  containerName,
			Image: bot.Image,
			Command: []string{
				"sh", "-c", fmt.Sprintf("cd /shared-data/repo && make build && ./bot %s", *bot.RndID),
			},
			VolumeMounts: []corev1.VolumeMount{
				{
					Name:      volumeName,
					MountPath: "/shared-data",
				},
			},
		})
	}

	mainContainer := corev1.Container{
		Name:    "game",
		Image:   game.Image,
		Command: append([]string{"./game"}, botIDs...),
	}

	podSpec := corev1.PodSpec{
		Volumes:        volumes,
		InitContainers: initContainers,
		Containers:     append([]corev1.Container{mainContainer}, botContainers...),
		RestartPolicy:  corev1.RestartPolicyNever,
	}

	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "game-" + game.ID.String(),
			Namespace: c.namespace,
		},
		Spec: batchv1.JobSpec{
			Completions: int32Ptr(1),
			Template: corev1.PodTemplateSpec{
				Spec: podSpec,
			},
		},
	}

	_, err := c.clientset.BatchV1().Jobs(c.namespace).Create(context.TODO(), job, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create job: %v", err)
	}

	c.logger.Infoln("Job with multiple containers created successfully", "jobName", job.Name)
	return nil
}

func int32Ptr(i int32) *int32 {
	return &i
}

func generateRandomID(n int) (string, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	var num uint64
	for i := 0; i < len(b) && i < 8; i++ {
		num = (num << 8) | uint64(b[i])
	}
	return fmt.Sprintf("%d", num), nil
}
