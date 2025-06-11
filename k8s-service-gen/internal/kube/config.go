package kube

import (
	"fmt"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"os"
	"path/filepath"
)

func getKubeConfig(kubePath *string) (*rest.Config, error) {
	config, err := rest.InClusterConfig()
	if err == nil {
		return config, nil
	}

	if kubePath == nil {
		defaultKubePath := filepath.Join(os.Getenv("HOME"), ".kube", "config")
		return clientcmd.BuildConfigFromFlags("", defaultKubePath)
	}

	return clientcmd.BuildConfigFromFlags("", *kubePath)
}

func GetKubeClient(kubePath *string) (*kubernetes.Clientset, error) {
	config, err := getKubeConfig(kubePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get kube config: %v", err)
	}

	return kubernetes.NewForConfig(config)
}
