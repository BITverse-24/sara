export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export interface ItemState {
    lastIntervalDays: number;
    stability: number;
    difficulty: number;
    lapses: number;
}


const DECAY_CONSTANT_K = -Math.log(0.9);

function gradeToRetrievability (g: Grade): number {
    const map: Record<number, number> = {
        0: 0.02,
        1: 0.15,
        2: 0.40,
        3: 0.75,
        4: 0.90,
        5: 0.98
    };
    return map[g];
}

function theoreticalSInc(D: number, S: number, R: number, fRS: (r: number, s: number) => number) {
    const factor = (5 * (1 - D) + 1);
    const fval = fRS(R, S);
    return factor * fval + 1;
}

function theoreticalRetrievability(stabilityDays: number, intervalDays: number): number {
    if (stabilityDays <= 0) return 0;
    const R = Math.exp(-DECAY_CONSTANT_K * (intervalDays / stabilityDays));
    return R;
}

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/**
 * Default f(R,S) fallback used inside the SInc baseline:
 *
 * SM-17: SInc := (5*(1-D)+1)*f(R,S) + 1
 *
 * The paper leaves f(R,S) to be fit from data. This implementation provides a
 * smooth, monotonic fallback:
 *   - increases with R, peaks around high R
 *   - slowly decays with log(1+S) (larger S -> slightly smaller contribution)
 *
 * You are free to replace this with an empirical / data-driven function or a matrix.
 */
function fRS(R: number, S: number): number {
    // R in (0..1); S >= 0
    // small positive floor to avoid zero
    const rPart = Math.pow(R, 0.9) / (1 + Math.exp(-12 * (R - 0.6))); // emphasise mid-high R
    const sPart = 1 / (1 + 0.08 * Math.log1p(S)); // mild decay with S
    const base = 1.0;
    const val = base * rPart * sPart;
    // keep it in reasonable numeric range
    return clamp(val, 0.01, 6.0);
}


/**
 * Simplified difficulty update sDF(Dprev, Grade, Rr)
 * The SM-17 paper gives the simplified form but no closed numeric formula; we provide
 * a conservative update rule:
 *
 * - Good grades (4-5) pull difficulty down (item looks easier)
 * - Poor grades (0-2) push difficulty up
 * - Rr (expected recall) tempers the update: if Rr predicted recall already low, grade matters less
 *
 * You can replace this hook with your own function.
 */
function SimplifiedDifficultyUpdate(Dprev: number, grade: Grade, Rr: number): number {
    const g = grade;
    // targetDifficulty derived from grade: low grade -> high difficulty
    const targetFromGrade = clamp(1 - (g / 5), 0, 1); // grade 5 -> 0, grade 0 -> 1
    // temper by Rr: if Rr predicted low recall, we trust grade less (so smaller change)
    const trust = clamp(0.6 + 0.4 * Rr, 0.2, 1.0); // more trust when predicted recall was high
    const learningRate = 0.25 * trust; // modest step-size
    const Dnew = clamp(Dprev + learningRate * (targetFromGrade - Dprev), 0, 1);
    return Dnew;
}

export function applySm17Repetition(
    item: ItemState,
    grade: Grade,
): ItemState {
    const forgettingIndex = 10;
    const FI_Term = Math.log(1 - forgettingIndex / 100) / Math.log(0.9);

    const retrievabilityWeights = {
        theoretical: 0.8,
        grade: 0.2
    };
    const stabilityWeights = {
        retrieve: 0.4,
        Sinc: 0.3,
        interval: 0.3,
    };

    const prevStability = item.stability;
    const prevInterval = item.lastIntervalDays;

    const theoryRetrievability = theoreticalRetrievability(prevStability, prevInterval);
    const gradeRetrievability = gradeToRetrievability(grade as Grade);

    const retrievability =
        (retrievabilityWeights.theoretical * theoryRetrievability + retrievabilityWeights.grade * gradeRetrievability) / 1;

    const retrieveStability = -(DECAY_CONSTANT_K * prevInterval) / Math.log(retrievability);

    const computedSInc = theoreticalSInc(item.difficulty, prevStability, retrievability, fRS);
    const SincStability = prevStability * computedSInc;
    const intervalStability = prevInterval / computedSInc * FI_Term;
    const stability = (grade < 3) ? 1 : (SincStability * stabilityWeights.Sinc + retrieveStability * stabilityWeights.retrieve + stabilityWeights.interval * intervalStability) / 1;

    const Sinc = theoreticalSInc(item.difficulty, stability, retrievability, fRS); 
    const newIntervalDays = (grade < 3) ? 1 : stability * Sinc *  FI_Term;

    const difficultyNew = SimplifiedDifficultyUpdate(item.difficulty, grade, theoryRetrievability);

    const lapsesNew = item.lapses + (grade < 3 ? 1 : 0);

    const newItem: ItemState = {...item};

    newItem.lastIntervalDays = newIntervalDays;
    newItem.stability = stability;
    newItem.difficulty = difficultyNew;
    newItem.lapses = lapsesNew;

    // const test = {
    //     theoryRetrievability,
    //     gradeRetrievability,
    //     retrievability,
    //     retrieveStability,
    //     SincStability,
    //     intervalStability,
    //     stability,
    //     computedSInc,
    //     newIntervalDays,
    //     difficultyNew
    // };
    // console.log(test)

    return newItem;
}

