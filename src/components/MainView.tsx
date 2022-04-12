import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GameHost } from './GameHost';
import { ScoreChart } from './ScoreChart';

export const MainView = () => {

    return <div>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>Game</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <GameHost />
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>Score Chart</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <ScoreChart />
            </AccordionDetails>
        </Accordion>
    </div>
}