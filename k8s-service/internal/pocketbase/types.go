package pocketbase

type Match struct {
	ID         string `json:"id"`
	State      string `json:"state"`
	WinnerTeam string `json:"winner_team"`
	Created    string `json:"created"`
	Updated    string `json:"updated"`
}

type RealtimeEvent struct {
	Subscription string `json:"subscription"`
	Action       string `json:"action"`
	Record       Match  `json:"record"`
}

type Team struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Locked  bool   `json:"locked"`
	Repo    string `json:"repo"`
	Event   string `json:"event"`
	Created string `json:"created"`
	Updated string `json:"updated"`
}
