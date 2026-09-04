export type CriterionId = 'evidence' | 'content' | 'compare' | 'routes';

export type CriterionState = 'unmet' | 'partial' | 'met';

export type CriterionShift = { id: CriterionId; state: CriterionState };

export type Message = {
  id: string;
  author: string;
  initial: string;
  role?: 'guide' | 'member' | 'support' | 'constructive' | 'critical' | 'deflect' | 'external' | 'empathy';
  text: string;
  reactions: string[];
  point?: { label: string; note: string };
  preview?: { title: string; meta: string; url: string };
  silentCore?: boolean;
  criteria?: CriterionShift[];
  branch?: boolean;
};

export type Mode = 'ambiguous' | 'pressure' | 'open' | 'verify';
