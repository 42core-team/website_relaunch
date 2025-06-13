package kube

import (
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (c *Client) CreatePodWithMultipleContainers() error {
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "multi-container-pod",
			Namespace: c.namespace,
			Labels:    map[string]string{"app": "multi-container"},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:  "container-1",
					Image: "nginx:latest",
				},
				{
					Name:  "container-2",
					Image: "busybox:latest",
					Command: []string{
						"sh", "-c", "echo Hello from container-2 && sleep 3600",
					},
				},
			},
		},
	}

	_, err := c.clientset.CoreV1().Pods(c.namespace).Create(context.TODO(), pod, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create pod: %v", err)
	}

	fmt.Println("Pod with multiple containers created successfully")
	return nil
}
