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
