package kube

import (
	"context"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (c *Client) CreateNameSpace(name string) error {
	namespace := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
	}

	_, err := c.clientset.CoreV1().Namespaces().Create(context.Background(), namespace, metav1.CreateOptions{})
	return err
}

func (c *Client) CreateDefaultNamespace() error {
	return c.CreateNameSpace(c.namespace)
}
