package kube

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (c *Client) CreateGameJob(game *Game) error {
	var botIDs []string
	for _, bot := range game.Bots {
		id, err := generateRandomID(16)
		if err != nil {
			return fmt.Errorf("error generating rnd IDs for bots %w", err)
		}
		bot.RndID = &id
		botIDs = append(botIDs, *bot.RndID)
	}

	job := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "game-" + game.ID.String(),
			Namespace: c.namespace,
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:    "game",
					Image:   game.Image,
					Command: append([]string{"./game"}, botIDs...),
				},
			},
			RestartPolicy: corev1.RestartPolicyNever,
		},
	}

	for _, bot := range game.Bots {
		volumeName := "shared-data-" + bot.ID.String()
		initContainerName := "clone-repo-" + bot.ID.String()
		containerName := "bot-" + bot.ID.String()

		job.Spec.Volumes = append(job.Spec.Volumes, corev1.Volume{
			Name: volumeName,
			VolumeSource: corev1.VolumeSource{
				EmptyDir: &corev1.EmptyDirVolumeSource{},
			},
		})
		job.Spec.InitContainers = append(job.Spec.InitContainers, corev1.Container{
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
		job.Spec.Containers = append(job.Spec.Containers, corev1.Container{
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

	_, err := c.clientset.CoreV1().Pods(c.namespace).Create(context.TODO(), job, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create job: %v", err)
	}

	fmt.Println("Pod with multiple containers created successfully")
	return nil
}

func generateRandomID(n int) (string, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
