package pocketbase

// import (
// 	"context"
// 	"log"

// 	"github.com/habibrosyad/pocketbase-go-sdk"
// )

// type Watcher struct {
// 	baseURL    string
// 	collection string
// 	adminKey   string
// }

// func NewWatcher(baseURL, collection, adminKey string) *Watcher {
// 	return &Watcher{
// 		baseURL:    baseURL,
// 		collection: collection,
// 		adminKey:   adminKey,
// 	}
// }

// //
// // "id": "test",
// //       "state": "planned",
// //       "winner_team": "RELATION_RECORD_ID",
// //       "created": "2022-01-01 10:00:00.123Z",
// //       "updated": "2022-01-01 10:00:00.123Z"

type Match struct {
	ID             string `json:"id"`
	State          string `json:"state"`
	WinnerTeam     string `json:"winner_team"`
	Created        string `json:"created"`
	Updated        string `json:"updated"`
	CollectionID   string `json:"collectionId"`
	CollectionName string `json:"collectionName"`
}

// func (w *Watcher) WatchMatches(ctx context.Context) error {
// 	client := pocketbase.NewClient(w.baseURL,
// 		pocketbase.WithAdminEmailPassword("jonas@42heilbronn.de", "prm0WGW3daz@ayn4juy"))
// 	collection := pocketbase.CollectionSet[Match](client, "matches")
// 	response, err := collection.List(pocketbase.ParamsList{
// 		Page: 1, Size: 10, Sort: "-created", Filters: "field~'test'",
// 	})
// 	if err != nil {
// 		log.Printf("Error listing matches: %v", err)
// 		return err
// 	}

// 	log.Printf("Initial matches: %+v", response)

// 	stream, err := collection.Subscribe()
// 	if err != nil {
// 		log.Printf("Error subscribing to matches: %v", err)
// 		return err
// 	}
// 	defer stream.Unsubscribe()

// 	<-stream.Ready()
// 	log.Println("Stream ready, listening for events...")

// 	for {
// 		select {
// 		case <-ctx.Done():
// 			log.Println("Context cancelled, stopping watch")
// 			return ctx.Err()
// 		case ev := <-stream.Events():
// 			log.Printf("Event received - Action: %s, Record: %+v", ev.Action, ev.Record)
// 		}
// 	}
// }
