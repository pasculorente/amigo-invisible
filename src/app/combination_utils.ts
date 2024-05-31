import { difference, union } from './collection_utils'
import { Person } from './types'


function any_match(
    value: string,
    people: Person[],
    indexes: number[],
    end: number
): boolean {
    /** 
     * Check if any of the previously selected options matches the value.
     * Since options are selected in order, end indicates the last valid selection.
     * 
     * @param value - current value to check against selections
     * @param people - list of participants
     * @param indexes - each value indicates the option selected by the person in the same index
     * @param end - last valid selection
     */
    if (end == 0) return false
    for (let k = 0; k < end; k++) {
        if (people[k].options[indexes[k]] == value) {
            return true
        }
    }
    return false
}

export async function total_combinations(people: Person[]): Promise<number> {
    // A      B      C      D
    // [0]=B  [0]=A  [0]=A  [0]=B
    // [1]=C  [1]=D  [1]=B  [1]=C
    // [0]=D         [2]=D

    let comb = 0
    // Current combination, only if position == people.length it is counted as valid
    const indexes = people.map(() => 0)
    // position will move from A to D (people[position]), back and forward
    // in every person, it wil select a valid candidate and move one step forward
    // in there are no valid candidates, it will move back
    // if its value is -1, the algorithm is finished
    let position = 0
    while (position >= 0) {
        const person = people[position]
        while (indexes[position] < person.options.length) {
            const option = person.options[indexes[position]]
            if (any_match(option, people, indexes, position)) {
                // not valid
                // select next option
                indexes[position] += 1
            } else {
                // valid
                if (position == people.length - 1) {
                    // Cout a combination if last position or move forward
                    indexes[position] += 1
                    comb += 1
                } else {
                    // Move forward otherwise
                    position += 1
                    break
                }
            }
        }
        // Consumed: reset and move back
        if (indexes[position] == person.options.length) {
            indexes[position] = 0
            position -= 1
            indexes[position] += 1
        }
    }
    return comb
}

export function shuffle<T>(array: T[]) {
    let currentIndex = array.length

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        // And swap it with the current element.
        ;[array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ]
    }
}

export function selectCandidates(people: Person[]): string[][] | null {
    return select(people, people, new Set())
}

function select(
    remaining: Person[],
    candidates: Person[],
    selected: Set<string>
): string[][] | null {
    if (remaining.length == 0) return []
    const candidate = remaining[0]
    const options = difference(candidate.options, selected)
    shuffle(options)
    while (options.length > 0) {
        const option = options.pop()!
        const pairs = select(
            remaining.slice(1),
            candidates,
            union(selected, [option])
        )
        if (pairs !== null) {
            pairs.unshift([candidate.key, option])
            return pairs
        }
    }
    return null
}
