import { LearningPlan, Technique } from '../types';
import { callLlm, parseLlmJson } from './llm.client';
import { buildPlanPrompt } from '../prompts/plan.prompt';
import config from '../config/environment';

interface LlmTechnique {
  name: string;
  description: string;
  category: string;
  emoji?: string;
  estimatedMinutes: number;
  level?: string;
  visualDescription?: string;
  lesson: {
    overview: string;
    steps: { order: number; title: string; body: string }[];
    exercise: {
      title: string;
      instruction: string;
      durationMinutes: number;
      goal: string;
    };
    proTips: string[];
  };
  keyTakeaways: { title: string; detail: string }[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Basics: '📘',
  Fundamentals: '🧱',
  Technique: '🎯',
  Theory: '📐',
  Practice: '🏋️',
  Rhythm: '🥁',
  Strategy: '♟️',
  Gear: '🔧',
  General: '⭐',
};

export async function generateLearningPlan(
  hobby: string,
  level: string,
  skippedTechniques: string[] = [],
): Promise<LearningPlan> {
  if (isChessHobby(hobby)) {
    return buildChessPlan(hobby, level);
  }

  if (isFootballHobby(hobby)) {
    return buildFootballPlan(hobby, level);
  }

  if (!config.groqApiKey) {
    return buildMockPlan(hobby, level);
  }

  const prompt = buildPlanPrompt(hobby, level, skippedTechniques);

  try {
    const raw = await callLlm(prompt);
    const parsed = parseLlmJson<{ techniques?: LlmTechnique[] }>(raw);
    const techniques = mapTechniques(parsed.techniques || [], level);

    return {
      hobby,
      targetLevel: level,
      createdAt: Date.now(),
      streakCount: 0,
      techniques,
    };
  } catch (error) {
    console.error('Plan generation failed, falling back to mock:', error);
    return buildMockPlan(hobby, level);
  }
}

function mapTechniques(raw: LlmTechnique[], level: string): Technique[] {
  return raw.map((tech, index) => ({
    id: `tech-${index}-${Date.now()}`,
    name: tech.name,
    description: tech.description,
    category: tech.category || 'Fundamentals',
    emoji: tech.emoji || CATEGORY_EMOJIS[tech.category] || '📖',
    estimatedMinutes: tech.estimatedMinutes || 3,
    level: tech.level || level,
    visualDescription: tech.visualDescription || tech.description,
    status: 'not-started' as const,
    lesson: {
      overview: tech.lesson?.overview || tech.description,
      steps: (tech.lesson?.steps || []).map((s, i) => ({
        order: s.order || i + 1,
        title: s.title,
        body: s.body,
      })),
      exercise: tech.lesson?.exercise || {
        title: `Practice ${tech.name}`,
        instruction: `Spend focused time practicing ${tech.name} with deliberate repetition.`,
        durationMinutes: tech.estimatedMinutes || 3,
        goal: 'Complete one full practice session.',
      },
      proTips: tech.lesson?.proTips || [],
    },
    keyTakeaways: tech.keyTakeaways || [],
  }));
}

function buildMockPlan(hobby: string, level: string): LearningPlan {
  return {
    hobby,
    targetLevel: level,
    createdAt: Date.now(),
    streakCount: 0,
    techniques: [
      {
        id: 'mock-1',
        name: 'The Fundamentals',
        description: `Core concepts of ${hobby} to build a strong base.`,
        category: 'Basics',
        emoji: '📘',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: `A focused learner practicing the fundamental movements of ${hobby} with careful attention to form.`,
        status: 'not-started',
        lesson: {
          overview: `This lesson introduces the foundational principles of ${hobby}. Understanding these basics is essential before moving to advanced techniques.`,
          steps: [
            { order: 1, title: 'Understand the Basics', body: `Start by familiarizing yourself with the core vocabulary and concepts of ${hobby}. Read through each term carefully and connect it to something you already know.` },
            { order: 2, title: 'Observe Before Doing', body: `Watch how experienced practitioners approach ${hobby}. Pay attention to posture, grip, timing, and flow.` },
            { order: 3, title: 'Try It Yourself', body: `Attempt the basic movements or actions. Focus on comfort over perfection. Repeat each action 5-10 times slowly.` },
          ],
          exercise: {
            title: 'Foundation Drill',
            instruction: `Set a timer and practice the basic stance and movements for ${hobby}. Focus on slow, deliberate repetitions.`,
            durationMinutes: 3,
            goal: 'Complete 3 sets of 10 slow repetitions with correct form.',
          },
          proTips: [
            'Slow practice builds faster muscle memory than rushing.',
            'Record yourself to spot mistakes you cannot feel.',
            'Consistency beats intensity — 15 minutes daily outperforms 2-hour weekend sessions.',
          ],
        },
        keyTakeaways: [
          { title: 'Start Slow', detail: 'Focus on form before speed.' },
          { title: 'Be Patient', detail: 'Mastery takes consistent daily effort.' },
        ],
      },
      {
        id: 'mock-2',
        name: 'Structured Practice',
        description: `How to practice effectively and build lasting habits for ${hobby}.`,
        category: 'Practice',
        emoji: '🧠',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: `A practice session broken into warm-up, focused practice, and cool-down phases for ${hobby}.`,
        status: 'not-started',
        lesson: {
          overview: `A structured practice routine separates amateurs from experts. This lesson covers how to optimize your practice time for ${hobby}.`,
          steps: [
            { order: 1, title: 'Warm Up', body: `Always start with a 3-5 minute warm-up. Review basic movements or concepts to get your mind and body ready for ${hobby}.` },
            { order: 2, title: 'Targeted Practice', body: 'Pick one specific weakness and spend 10 minutes working only on that.' },
            { order: 3, title: 'Cool Down', body: 'End your session with something fun and creative within the hobby.' },
          ],
          exercise: {
            title: 'The Focus Block',
            instruction: 'Use the Pomodoro technique: warm-up, focused practice, cool-down.',
            durationMinutes: 3,
            goal: 'Complete the block without distraction.',
          },
          proTips: [
            'Keep a practice journal to track what you worked on.',
            'Stop practicing when frustrated — take a break and return later.',
          ],
        },
        keyTakeaways: [
          { title: 'Structure Matters', detail: 'Random practice leads to random results.' },
          { title: 'Focus on Weaknesses', detail: 'Growth happens when you tackle difficult things.' },
        ],
      },
    ],
  };
}

function isChessHobby(hobby: string): boolean {
  return hobby.trim().toLowerCase().includes('chess');
}

function isFootballHobby(hobby: string): boolean {
  const normalized = hobby.trim().toLowerCase();
  return normalized.includes('football') || normalized.includes('soccer');
}

function buildChessPlan(hobby: string, level: string): LearningPlan {
  return {
    hobby,
    targetLevel: level,
    createdAt: Date.now(),
    streakCount: 0,
    techniques: [
      {
        id: 'chess-fork',
        name: 'Fork Tactics',
        description: 'Create one move that attacks two valuable pieces at once and forces your opponent to respond.',
        category: 'Tactics',
        emoji: '♞',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: 'A knight jumps to attack two pieces at the same time.',
        status: 'not-started',
        lesson: {
          overview: 'Forks are one of the cleanest ways to win material in chess. The idea is simple: one piece creates pressure on two targets, and the opponent can only save one of them.',
          steps: [
            { order: 1, title: 'Spot Targets', body: 'Look for two pieces or a king and a piece that could be attacked together. Knights are especially strong for forks because they move in an awkward pattern.' },
            { order: 2, title: 'Place the Fork', body: 'Move the attacking piece so both targets are threatened on the same move. Check whether the fork is forcing or whether the opponent has an easy escape.' },
            { order: 3, title: 'Win the Material', body: 'After the fork lands, choose the best capture or trade. The goal is not just to attack, but to convert that pressure into a concrete gain.' },
          ],
          exercise: {
            title: 'Knight Fork Drill',
            instruction: 'Set up positions where a knight can attack two pieces at once. Try to find the move before moving the piece. Repeat until the pattern feels automatic.',
            durationMinutes: 3,
            goal: 'Find 5 correct fork moves in a row.',
          },
          proTips: [
            'Forks are easier to spot when the enemy pieces are close together.',
            'Knights are the classic fork piece, but queens and pawns can fork too.',
            'Always check whether the fork also creates a check or wins the queen.',
          ],
        },
        keyTakeaways: [
          { title: 'Look for two targets', detail: 'A fork only works when one move creates multiple threats.' },
          { title: 'Use forcing moves', detail: 'Checks and tactical threats make forks much harder to defend.' },
        ],
      },
      {
        id: 'chess-pin',
        name: 'Pin Patterns',
        description: 'Restrict a piece by making it unsafe to move because something more valuable sits behind it.',
        category: 'Tactics',
        emoji: '♟️',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: 'A bishop or rook holds a piece in place because moving it would expose a stronger target.',
        status: 'not-started',
        lesson: {
          overview: 'Pins are about control. A pinned piece cannot move freely because doing so would expose a more valuable piece behind it, often the king or queen.',
          steps: [
            { order: 1, title: 'Find the Line', body: 'Identify pieces that sit on the same file, rank, or diagonal. Pins work best when the line is straight and the target behind is important.' },
            { order: 2, title: 'Apply Pressure', body: 'Place a rook, bishop, or queen so the front piece becomes tied to the piece behind it. Make sure the pin is actually meaningful, not just cosmetic.' },
            { order: 3, title: 'Increase the Bind', body: 'Add more attackers or improve piece placement so the pinned piece stays stuck. Often the pin becomes stronger after you stack pressure on the same line.' },
          ],
          exercise: {
            title: 'Absolute Pin Drill',
            instruction: 'Practice identifying pieces pinned to the king. Then repeat with pins to the queen or rook so you can compare the difference.',
            durationMinutes: 3,
            goal: 'Correctly identify 5 pins and explain what piece is trapped behind each one.',
          },
          proTips: [
            'A pin is strongest when the pinned piece is defending something critical.',
            'Sometimes the best move is not to take the pinned piece, but to intensify the pressure.',
            'Always ask what happens if the pinned piece moves anyway.',
          ],
        },
        keyTakeaways: [
          { title: 'Pieces can be frozen', detail: 'A pinned piece loses freedom because of the more valuable target behind it.' },
          { title: 'Lines matter', detail: 'Bishops, rooks, and queens create pins along open lines.' },
        ],
      },
      {
        id: 'chess-skewer',
        name: 'Skewer Motifs',
        description: 'Attack a valuable piece in front so that a weaker piece behind it becomes exposed after the front piece moves.',
        category: 'Tactics',
        emoji: '♜',
        estimatedMinutes: 3,
        level: 'Intermediate',
        visualDescription: 'A long-range piece attacks a stronger piece and reveals a weaker piece behind it.',
        status: 'not-started',
        lesson: {
          overview: 'A skewer is the pin in reverse. The more valuable piece is in front, and when it moves away, the less valuable piece behind it gets captured.',
          steps: [
            { order: 1, title: 'Find the Valuable Front Piece', body: 'Look for positions where the king, queen, or another major piece stands in front of a smaller target on the same line.' },
            { order: 2, title: 'Strike Through the Line', body: 'Use a bishop, rook, or queen to attack the front piece directly. Force it to move or trade so the back piece becomes exposed.' },
            { order: 3, title: 'Collect the Back Piece', body: 'Once the front piece shifts away, capture the piece behind it or win material from the resulting position.' },
          ],
          exercise: {
            title: 'Line Attack Drill',
            instruction: 'Set up skewer positions and try to identify the winning move without moving any pieces. Focus on bishop and rook lines first.',
            durationMinutes: 3,
            goal: 'Solve 5 skewer positions correctly.',
          },
          proTips: [
            'Skewers are often easier to see on open files and diagonals.',
            'The front piece usually has to move because it is more valuable.',
            'Look for hidden tactics after the front piece is forced away.',
          ],
        },
        keyTakeaways: [
          { title: 'Front piece first', detail: 'Attack the stronger piece so the weaker one behind it is exposed.' },
          { title: 'Long-range power', detail: 'Rooks, bishops, and queens are the classic skewer pieces.' },
        ],
      },
      {
        id: 'chess-checkmate',
        name: 'Mate Net',
        description: 'Build a coordinated attack that leaves the enemy king with no safe squares.',
        category: 'Strategy',
        emoji: '♚',
        estimatedMinutes: 4,
        level: 'Intermediate',
        visualDescription: 'Multiple pieces coordinate around the king until every escape square is covered.',
        status: 'not-started',
        lesson: {
          overview: 'Checkmate patterns are the final step of tactical pressure. The goal is to coordinate pieces so the king cannot escape, block, or capture its way out.',
          steps: [
            { order: 1, title: 'Limit the King', body: 'Start by restricting the king’s escape squares with your pieces and pawns. A mate net only works when the enemy king has very little room to run.' },
            { order: 2, title: 'Stack Attackers', body: 'Bring another piece into the attack so the king is overloaded. One attacker often creates the weakness, while the second finishes the job.' },
            { order: 3, title: 'Deliver the Finish', body: 'Look for the move that seals every escape square. Often the final mating pattern comes from simple coordination, not a flashy sacrifice.' },
          ],
          exercise: {
            title: 'Mate Net Builder',
            instruction: 'Practice finding mate-in-one or mate-in-two patterns from simple positions. Focus on covering escape squares before searching for the final move.',
            durationMinutes: 4,
            goal: 'Recognize 3 mating nets and explain why the king cannot escape.',
          },
          proTips: [
            'Mate nets are easier when the king is boxed in by its own pieces.',
            'Count escape squares before looking for the final move.',
            'Sometimes the best tactic is to threaten mate and force concessions.',
          ],
        },
        keyTakeaways: [
          { title: 'Coordinate pieces', detail: 'Checkmate is usually a team effort.' },
          { title: 'Cover escape squares', detail: 'A king is trapped only when every legal move is removed.' },
        ],
      },
    ],
  };
}

function buildFootballPlan(hobby: string, level: string): LearningPlan {
  return {
    hobby,
    targetLevel: level,
    createdAt: Date.now(),
    streakCount: 0,
    techniques: [
      {
        id: 'football-first-touch',
        name: 'First Touch',
        description: 'Control the ball cleanly with your first contact so your next action is already set up.',
        category: 'Technique',
        emoji: '⚽',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: 'A player cushions the ball into space before passing or dribbling.',
        status: 'not-started',
        lesson: {
          overview: 'A good first touch gives you time. Instead of stopping the ball dead, guide it into the space where your next pass, dribble, or shot becomes easier.',
          steps: [
            { order: 1, title: 'Prepare Early', body: 'Open your body before the ball arrives. Check your shoulder and decide where the next touch should go.' },
            { order: 2, title: 'Cushion the Ball', body: 'Relax the receiving foot and take pace off the ball. Let the touch move slightly into space instead of bouncing away.' },
            { order: 3, title: 'Play the Next Action', body: 'After the touch, pass, dribble, or turn immediately. The goal is a smooth two-action rhythm.' },
          ],
          exercise: {
            title: 'Wall First-Touch Drill',
            instruction: 'Pass against a wall and receive with one touch into space. Alternate feet and keep the ball within one step after every touch.',
            durationMinutes: 3,
            goal: 'Complete 20 controlled first touches without chasing the ball.',
          },
          proTips: [
            'Point your first touch away from pressure.',
            'Use the inside of the foot for control and the outside for quicker turns.',
            'Look up before the ball arrives, not after.',
          ],
        },
        keyTakeaways: [
          { title: 'Touch into space', detail: 'The first touch should prepare the next move.' },
          { title: 'Body shape matters', detail: 'Open hips give you more passing and turning options.' },
        ],
      },
      {
        id: 'football-passing-lanes',
        name: 'Passing Lanes',
        description: 'Move and scan to create clear angles for simple, reliable passes.',
        category: 'Vision',
        emoji: '⚽',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: 'Players create triangles so the ball can move through open passing lanes.',
        status: 'not-started',
        lesson: {
          overview: 'Passing lanes are the invisible roads between teammates. Good players keep moving to keep those roads open.',
          steps: [
            { order: 1, title: 'Scan the Field', body: 'Before receiving, look for teammates and defenders. Notice which passing lane is open and which one is blocked.' },
            { order: 2, title: 'Create an Angle', body: 'Move a few steps left, right, forward, or backward to give the passer a clean lane. Small movement can change the whole play.' },
            { order: 3, title: 'Pass With Purpose', body: 'Use a firm pass into the receiver’s path. A good pass helps your teammate play quickly.' },
          ],
          exercise: {
            title: 'Triangle Passing',
            instruction: 'Set three markers in a triangle. Pass and move after every touch so a new passing lane is always available.',
            durationMinutes: 3,
            goal: 'Complete 30 passes while moving after each one.',
          },
          proTips: [
            'Do not stand behind a defender’s cover shadow.',
            'Pass to the safe foot when your teammate is under pressure.',
            'Move immediately after passing.',
          ],
        },
        keyTakeaways: [
          { title: 'Angles open play', detail: 'A small movement can create a clean pass.' },
          { title: 'Scan before receiving', detail: 'You need the next pass in mind before the ball arrives.' },
        ],
      },
      {
        id: 'football-ball-control',
        name: 'Ball Control',
        description: 'Keep the ball close while changing direction, speed, and body shape.',
        category: 'Dribbling',
        emoji: '⚽',
        estimatedMinutes: 3,
        level: 'Beginner',
        visualDescription: 'A player uses short touches to guide the ball around markers.',
        status: 'not-started',
        lesson: {
          overview: 'Ball control is about keeping the ball playable. Short, balanced touches let you change direction without losing momentum.',
          steps: [
            { order: 1, title: 'Use Short Touches', body: 'Keep the ball close enough that you can touch it again quickly. Long touches give defenders time to step in.' },
            { order: 2, title: 'Change Direction', body: 'Use the inside, outside, and sole of your foot to move the ball. Mix small changes with sharper cuts.' },
            { order: 3, title: 'Stay Balanced', body: 'Keep your knees soft and your upper body steady. Balance makes every touch cleaner.' },
          ],
          exercise: {
            title: 'Cone Slalom',
            instruction: 'Dribble through five markers using both feet. Go slowly first, then increase speed only when control stays clean.',
            durationMinutes: 3,
            goal: 'Complete 5 clean slalom runs without hitting a marker.',
          },
          proTips: [
            'Speed is useful only when the ball stays close.',
            'Use your body to shield the ball from pressure.',
            'Practice with both feet every session.',
          ],
        },
        keyTakeaways: [
          { title: 'Keep it playable', detail: 'The ball should stay close enough for the next touch.' },
          { title: 'Control before speed', detail: 'Clean touches matter more than rushing.' },
        ],
      },
      {
        id: 'football-finishing',
        name: 'Finishing',
        description: 'Turn good chances into goals with controlled, well-placed shots.',
        category: 'Shooting',
        emoji: '⚽',
        estimatedMinutes: 4,
        level: 'Intermediate',
        visualDescription: 'A player places a shot into the corner after setting the ball out of their feet.',
        status: 'not-started',
        lesson: {
          overview: 'Finishing is less about power and more about decision, timing, and placement. A clean shot into the right space beats a wild shot with more force.',
          steps: [
            { order: 1, title: 'Set the Ball', body: 'Take the ball slightly out of your feet so your shooting leg can swing naturally.' },
            { order: 2, title: 'Pick a Corner', body: 'Look at the keeper and choose a target before striking. Aim low and controlled when under pressure.' },
            { order: 3, title: 'Follow Through', body: 'Keep your body over the ball and follow through toward the target. This keeps the shot from rising too much.' },
          ],
          exercise: {
            title: 'Corner Finish Drill',
            instruction: 'Place two targets near the corners of the goal. Take one setup touch, then finish into a target with control.',
            durationMinutes: 4,
            goal: 'Hit the target area 6 times from 10 attempts.',
          },
          proTips: [
            'Placement beats power from close range.',
            'Your plant foot points toward the target.',
            'Stay calm after the setup touch.',
          ],
        },
        keyTakeaways: [
          { title: 'Set before shooting', detail: 'The setup touch creates the shot.' },
          { title: 'Aim with control', detail: 'A composed finish is usually better than a rushed blast.' },
        ],
      },
    ],
  };
}
