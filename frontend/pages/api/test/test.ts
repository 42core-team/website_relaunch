import type { NextApiRequest, NextApiResponse } from 'next'
import {pbAdmin} from "@/pbase";

export default function handler(req: NextApiRequest, res: NextApiResponse) {

    pbAdmin.collection("events").getList(1, 50, {
    }).then((records) => {
        res.json(records)
    }).catch((err) => {
        res.status(500).json({error: err})
    })
}