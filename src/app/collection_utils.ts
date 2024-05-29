export function difference<T>(array: T[], substract: Iterable<T>): T[] {
    const exceptions = new Set(substract)
    return array.filter((element) => !exceptions.has(element))
}

export function union<T>(set: Set<T>, addition: Iterable<T>): Set<T> {
    const result = new Set(set)
    for (const add of addition) result.add(add)
    return result
}

export function unions<T>(...collections: Iterable<T>[]): Set<T> {
    const result = new Set<T>()
    for (const col of collections) {
        for (const item of col) {
            result.add(item)
        }
    }
    return result
}
