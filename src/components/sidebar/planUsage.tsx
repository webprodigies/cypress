import React from 'react';
import { Progress } from '@/components/ui/progress';
import CypressDiamondIcon from '../icons/cypressDiamongIcon';

const PlanUsage = () => {
  return (
    <article className=" mb-4">
      <div className="flex gap-2 text-muted-foreground mb-2  items-center">
        <div className="h-4 w-4">
          <CypressDiamondIcon />
        </div>
        <div className="flex justify-between w-full items-center">
          <div> Free Plan</div>
          <small> 30%</small>
        </div>
      </div>

      <Progress
        value={33}
        className=" h-1"
      />
    </article>
  );
};

export default PlanUsage;
