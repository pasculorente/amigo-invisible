import Table from 'react-bootstrap/Table'

import { Person } from './types'

export function to_table(text: string): string[][] {
    return split_filter(text.replaceAll('\r\n', '\n'), '\n').map(
        (line: string) => line.split(',')
    )
}

export function split_filter(text: string | null, separator: string): string[] {
    if (text === null) return[]
    return text.split(separator).filter((value) => value)
}

function name_span(person: Person) {
    return (
        <span
            key={person.key}
            className="name-span"
            style={{ backgroundColor: person.color, color: person.text }}
        >
            {person.name}
        </span>
    )
}

export function exclusions_table(
    ps: Person[],
    index: Map<string, Person>,
    years: string[]
) {
    let key = 0
    const rows = ps.map((p) => {
        const exclusions = p.exclude.map((key) => name_span(index.get(key)!))
        return (
            <tr key={'person_' + key++}>
                <td key={'td_' + key++}>{name_span(p)}</td>
                <td key={'td_' + key++}>{exclusions}</td>
                {p.history.map((h) => (
                    <td key={'td_' + key++}>
                        {h ? name_span(index.get(h)!) : null}
                    </td>
                ))}
            </tr>
        )
    })
    const table = (
        <Table striped bordered responsive size="sm">
            <thead>
                <tr>
                    <th key={'th_' + key++}>Nombre</th>
                    <th key={'th_' + key++}>Excluidos</th>
                    {years.map((y) => (
                        <th key={'th_' + key++}>{y}</th>
                    ))}
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    )
    return table
}

export function bags_table(ps: Person[], index: Map<string, Person>) {
    let key = 0
    const rows = ps.map((p) => {
        return (
            <tr key={'person_' + key++}>
                <td key={'td_' + key++}>{name_span(p)}</td>
                <td key={'td_' + key++}>
                    {p.options.map((key) => name_span(index.get(key)!))}
                </td>
            </tr>
        )
    })
    const table = (
        <Table striped bordered responsive size="sm">
            <thead>
                <tr>
                    <th key={'th_' + key++}>Nombre</th>
                    <th key={'th_' + key++}>Bolsa</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    )
    return table
}

export function combination_table(
    combinations: string[][],
    index: Map<string, Person>
) {
    let key = 0
    const rows = combinations.map((p) => (
        <tr key={'comb_' + key++}>
            <td>{name_span(index.get(p[0])!)}</td>
            <td>{name_span(index.get(p[1])!)}</td>
        </tr>
    ))
    const table = (
        <Table striped bordered responsive size="sm">
            <thead>
                <tr>
                    <th>De</th>
                    <th>Para</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    )
    return table
}
