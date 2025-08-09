package kube

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (c *Client) GetContainersOfGame(gameID uuid.UUID) ([]string, error) {
	var containers []string

	pods, err := c.clientset.CoreV1().Pods(c.namespace).List(context.Background(), metav1.ListOptions{
		LabelSelector: "job-name=game-" + gameID.String(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	for _, pod := range pods.Items {
		for _, container := range pod.Spec.Containers {
			containers = append(containers, container.Name)
		}
	}

	return containers, nil
}

func (c *Client) GetLogsOfContainer(gameID uuid.UUID, containerName string) (*string, error) {
	pods, err := c.clientset.CoreV1().Pods(c.namespace).List(context.Background(), metav1.ListOptions{
		LabelSelector: "job-name=game-" + gameID.String(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	if len(pods.Items) == 0 {
		return nil, fmt.Errorf("no pods found for game %q", gameID.String())
	}

	pod := pods.Items[0]
	limit := int64(1024 * 1024) // Limit to 1MB

	req := c.clientset.CoreV1().Pods(c.namespace).GetLogs(pod.Name, &v1.PodLogOptions{
		Container:  containerName,
		Follow:     false,
		LimitBytes: &limit,
	})
	logsBytes, err := req.Do(context.Background()).Raw()
	if err != nil {
		return nil, fmt.Errorf("failed to get logs: %w", err)
	}
	logs := string(logsBytes)
	return &logs, nil
}
