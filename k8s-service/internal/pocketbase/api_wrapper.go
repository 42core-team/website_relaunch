//Class that is able to do requests to the pocketbase api over http and SSE
// dont use the pocketbase client

package pocketbase

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
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

type TeamPaginatedResponse struct {
	Page       int     `json:"page"`
	PerPage    int     `json:"perPage"`
	TotalPages int     `json:"totalPages"`
	TotalItems int     `json:"totalItems"`
	Items      []*Team `json:"items"`
}

func (a *APIWrapper) GetMatches() ([]Match, error) {
	url := fmt.Sprintf("%s/api/collections/matches/records", a.baseURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Authorization", a.adminKey)

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

	var response PaginatedResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}

	return response.Items, nil
}

func (a *APIWrapper) GetMatch(id string) (*Match, error) {
	url := fmt.Sprintf("%s/api/collections/matches/records/%s", a.baseURL, id)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", a.adminKey)

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

		lastPollTime := time.Now()
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			currentPollTime := time.Now()
			url := fmt.Sprintf("%s/api/collections/matches/records?sort=-updated", a.baseURL)

			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				errChan <- fmt.Errorf("failed to create request: %v", err)
				continue
			}
			req.Header.Set("Authorization", a.adminKey)

			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				errChan <- fmt.Errorf("failed to make request: %v", err)
				continue
			}

			var response PaginatedResponse
			if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
				resp.Body.Close()
				errChan <- fmt.Errorf("failed to decode response: %v", err)
				continue
			}
			resp.Body.Close()

			// Process only matches that were updated since last poll
			for _, match := range response.Items {
				const customLayout = "2006-01-02 15:04:05.000Z" // Matches "2025-02-18 09:47:27.521Z"
				updatedTime, err := time.Parse(customLayout, match.Updated)
				if err != nil {
					log.Printf("Error parsing update time for match %s: %v", match.ID, err)
					continue
				}

				if updatedTime.After(lastPollTime) {
					matchChan <- match
				}
			}

			lastPollTime = currentPollTime
		}
	}()

	return matchChan, errChan
}

func (a *APIWrapper) GetMatchTeams(match_id string) ([]*Team, error) {
	url := fmt.Sprintf("%s/api/collections/match_teams/records?filter=(match='%s')", a.baseURL, match_id)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Authorization", a.adminKey)

	log.Printf("Fetching teams for match %s...", match_id)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Error response: %s", string(body))
		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(body))
	}

	// Debug response
	body, _ := io.ReadAll(resp.Body)

	var response TeamPaginatedResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	log.Printf("Found %d teams", len(response.Items))
	return response.Items, nil
}
