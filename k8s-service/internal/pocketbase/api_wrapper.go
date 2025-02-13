//Class that is able to do requests to the pocketbase api over http and SSE
// dont use the pocketbase client

package pocketbase

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type APIWrapper struct {
	baseURL  string
	adminKey string
}

func NewAPIWrapper(baseURL, adminKey string) *APIWrapper {
	return &APIWrapper{baseURL: baseURL, adminKey: adminKey}
}

type PaginatedResponse struct {
	Page       int     `json:"page"`
	PerPage    int     `json:"perPage"`
	TotalPages int     `json:"totalPages"`
	TotalItems int     `json:"totalItems"`
	Items      []Match `json:"items"`
}

func (a *APIWrapper) GetMatches() ([]Match, error) {
	url := fmt.Sprintf("%s/api/collections/matches/records", a.baseURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", a.adminKey))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Debug response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}
	log.Printf("Response body: %s", string(body))

	var response PaginatedResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}

	log.Printf("Successfully decoded %d matches", len(response.Items))
	return response.Items, nil
}

func (a *APIWrapper) GetMatch(id string) (*Match, error) {
	url := fmt.Sprintf("%s/api/collections/matches/records/%s", a.baseURL, id)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", a.adminKey))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var match Match
	err = json.NewDecoder(resp.Body).Decode(&match)
	if err != nil {
		return nil, err
	}
	return &match, nil
}

// Start a SSE connection to the pocketbase api
// Then subscribe to collection
func (a *APIWrapper) SubscribeToMatches() (<-chan Match, <-chan error) {
	matchChan := make(chan Match)
	errChan := make(chan error)

	go func() {
		defer close(matchChan)
		defer close(errChan)

		clientID := uuid.New().String()
		url := fmt.Sprintf("%s/api/realtime", a.baseURL)

		// First establish connection
		connectPayload := fmt.Sprintf(`{"clientId":"%s"}`, clientID)
		req, err := http.NewRequest("POST", url, strings.NewReader(connectPayload))
		if err != nil {
			errChan <- fmt.Errorf("failed to create connect request: %v", err)
			return
		}

		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", a.adminKey))
		req.Header.Set("Content-Type", "application/json")

		log.Printf("Connecting to realtime endpoint with client ID: %s", clientID)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			errChan <- fmt.Errorf("failed to connect: %v", err)
			return
		}
		resp.Body.Close()

		// Then subscribe to the collection
		subscribePayload := fmt.Sprintf(`{"clientId":"%s","subscriptions":["matches"]}`, clientID)
		req, err = http.NewRequest("POST", url, strings.NewReader(subscribePayload))
		if err != nil {
			errChan <- fmt.Errorf("failed to create subscribe request: %v", err)
			return
		}

		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", a.adminKey))
		req.Header.Set("Content-Type", "application/json")

		log.Printf("Subscribing to matches collection...")
		resp, err = http.DefaultClient.Do(req)
		if err != nil {
			errChan <- fmt.Errorf("failed to subscribe: %v", err)
			return
		}
		defer resp.Body.Close()

		log.Printf("Connected with status: %s", resp.Status)

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()
			log.Printf("Received SSE line: %s", line)

			if strings.HasPrefix(line, "data: ") {
				data := strings.TrimPrefix(line, "data: ")
				var event struct {
					Type   string `json:"type"`
					Record Match  `json:"record"`
				}

				if err := json.Unmarshal([]byte(data), &event); err != nil {
					log.Printf("Error unmarshaling event: %v", err)
					continue
				}

				if event.Type == "create" || event.Type == "update" {
					log.Printf("Received match event - Type: %s, Match ID: %s, State: %s",
						event.Type, event.Record.ID, event.Record.State)
					matchChan <- event.Record
				}
			}
		}

		if err := scanner.Err(); err != nil {
			errChan <- fmt.Errorf("scanner error: %v", err)
		}
	}()

	return matchChan, errChan
}
