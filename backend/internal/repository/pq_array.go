package repository

import "github.com/lib/pq"

func pqStringArray(target *[]string) interface{} {
	return pq.Array(target)
}
