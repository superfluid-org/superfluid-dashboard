import { NextApiRequest, NextApiResponse } from "next";
import { tranch1 } from "./mock-responses/tranch1";
import { tranch2 } from "./mock-responses/tranch2";
import { tranch3 } from "./mock-responses/tranch3";
import { tranch4 } from "./mock-responses/tranch4";
import { tranch5 } from "./mock-responses/tranch5";
import { tranch6 } from "./mock-responses/tranch6";

const tranches = {
    1: tranch1,
    2: tranch2,
    3: tranch3,
    4: tranch4,
    5: tranch5,
    6: tranch6,
} as const;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<unknown>
) {
    // Get the tranch parameter from the query
    const tranchParam = req.query.tranch;

    // Validate that tranch is provided and is a number
    if (!tranchParam || typeof tranchParam !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Tranch parameter is required as a query parameter'
        });
    }

    const tranch = parseInt(tranchParam, 10);
    if (isNaN(tranch)) {
        return res.status(400).json({
            success: false,
            message: 'Tranch parameter must be a valid number'
        });
    }

    const tranchData = tranches[tranch as keyof typeof tranches];
    if (!tranchData) {
        return res.status(400).json({
            success: false,
            message: 'Invalid tranch number'
        });
    }

    res.status(200).json(tranchData)
}
