import './App.css'
import Table from 'react-bootstrap/Table'
import React, { useState } from 'react'
import { Button, Form, Offcanvas, Tab, Tabs } from 'react-bootstrap'

function generateColorWheel(numColors: number, lightness = 0.5) {
    const colors = []
    const contrastColors = []
    const hueStep = 360 / numColors

    for (let i = 0; i < numColors; i++) {
        const hue = i * hueStep
        const color = `hsl(${hue}, 100%, ${lightness * 100}%)`
        colors.push(color)

        // Calculate the highest contrast color
        let contrastColor
        if (hue >= 20 && hue < 200) {
            // Yellows and greens use black
            contrastColor = 'black'
        } else {
            // Blues and reds use white
            contrastColor = 'white'
        }
        contrastColors.push(contrastColor)
    }

    return [colors, contrastColors]
}

type Person = {
    key: string
    name: string
    exclude: string[]
    history: string[]
    options: string[]
    color: string
    text: string
}
function to_table(text: string): string[][] {
    return split_filter(text.replaceAll('\r\n', '\n'), '\n').map(
        (line: string) => line.split(',')
    )
}

function split_filter(text: string, separator: string): string[] {
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

function exclusions_table(
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

function bags_table(ps: Person[], index: Map<string, Person>) {
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

function combination_table(
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

function shuffle<T>(array: T[]) {
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

function difference<T>(array: T[], substract: Iterable<T>): T[] {
    const exceptions = new Set(substract)
    return array.filter((element) => !exceptions.has(element))
}

function union<T>(set: Set<T>, addition: Iterable<T>): Set<T> {
    const result = new Set(set)
    for (const add of addition) result.add(add)
    return result
}

function unions<T>(...collections: Iterable<T>[]): Set<T> {
    const result = new Set<T>()
    for (const col of collections) {
        for (const item of col) {
            result.add(item)
        }
    }
    return result
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

function any_match(
    value: string,
    people: Person[],
    indexes: number[],
    end: number
): boolean {
    if (end == 0) return false
    for (let k = 0; k < end; k++) {
        if (people[k].options[indexes[k]] == value) {
            return true
        }
    }
    return false
}

async function total_combinations(people: Person[]): Promise<number> {
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

function load_data(content: string): { people: Person[]; years: string[] } {
    const data = to_table(content)
    const keys = data.slice(1).map((row) => row[0])
    const years = data[0].slice(3)
    const [BG_COLORS, COLORS] = generateColorWheel(data.length - 1, 0.85)
    const ps: Person[] = data
        .slice(1)
        .map((line: string[], position: number) => {
            const exclude = split_filter(line[2], ';')
            const history = line.slice(3)
            const exclusions = unions(
                exclude,
                history.filter((h) => h),
                [line[0]]
            )
            return {
                key: line[0],
                name: line[1],
                exclude: exclude,
                history: history,
                options: difference(keys, exclusions),
                color: BG_COLORS[position],
                text: COLORS[position],
            }
        })
    return { people: ps, years: years }
}

function FileFormat(
    props: { lang?: 'en' | 'es' } = { lang: 'es' }
): React.ReactElement {
    if (props.lang == 'en')
        return (
            <div style={{ fontSize: 'smaller' }}>
                Use a CSV file, separated by commas, with the columns:
                <ol>
                    <li>
                        <strong>key:</strong> unique key for each participant
                    </li>
                    <li>
                        <strong>name:</strong> name of participant
                    </li>
                    <li>
                        <strong>exclusions:</strong> semicolon separated list of
                        exclusions for this participant. Use values from key
                        column. Can be empty
                    </li>
                    <li>
                        <strong>2020,2021:</strong> any number of year columns,
                        with the history. One key per cell. Can be empty
                    </li>
                </ol>
            </div>
        )
    return (
        <div style={{ fontSize: 'smaller' }}>
            Archivo CSV, separado por comas, con las siguientes columnas:
            <ol>
                <li>
                    <strong>codigo:</strong> clave única para cada participante
                </li>
                <li>
                    <strong>nombre:</strong> nombre del participante
                </li>
                <li>
                    <strong>exclusiones:</strong> lista separada por <i>;</i> de
                    códigos para no incluir
                </li>
                <li>
                    <strong>2020,2021:</strong> una columna por año y un código
                    por celda para describir la historia
                </li>
            </ol>
        </div>
    )
}

function sel(people: Person[]): string[][] | null {
    return select(people, people, new Set())
}

function App() {
    const [combination, setCombination] = useState<string[][] | null>(null)
    const [data, setData] = useState<{
        people: Person[]
        years: string[]
    } | null>(null)
    const [totalCombinations, setTotalCombinations] = useState<number>(0)
    const [showHelp, setShowHelp] = useState(false)

    const handleClose = () => setShowHelp(false)
    const handleShow = () => setShowHelp(true)

    let exclusions_t = null
    let bags_t = null
    let comb_t = null
    if (data !== null) {
        const { people, years } = data
        const index: Map<string, Person> = new Map()
        people.forEach((p) => index.set(p.key, p))
        exclusions_t = exclusions_table(people, index, years)
        bags_t = bags_table(people, index)
        if (combination != null) {
            comb_t = combination_table(combination!, index)
        }
    }

    function load(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files == null) return
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                const content = load_data(reader.result! as string)
                setData(content)
                total_combinations(content.people).then((comb) =>
                    setTotalCombinations(comb)
                )
            }
            reader.readAsText(file)
        }
    }
    return (
        <div className="mainLayout">
            <Offcanvas show={showHelp} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Ayuda</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <FileFormat />
                </Offcanvas.Body>
            </Offcanvas>

            <Tabs id="tabs">
                <Tab title="Datos" eventKey="data">
                    <Form.Group controlId="formFileSm" className="mb-3">
                        <div style={{ display: 'flex', marginTop: '1em' }}>
                            <Form.Control
                                type="file"
                                size="sm"
                                name="inputFile"
                                onChange={load}
                            />
                            <Button
                                style={{ marginLeft: '1rem' }}
                                variant="outline-info"
                                size="sm"
                                onClick={handleShow}
                            >
                                Ayuda
                            </Button>
                        </div>
                    </Form.Group>
                    {exclusions_t}
                </Tab>
                <Tab title="Opciones" eventKey="options">
                    {bags_t}
                </Tab>
            </Tabs>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
                {totalCombinations.toLocaleString() + ' combinaciones'}
            </div>
            {data ? (
                <Button
                    id="btn"
                    onClick={() => setCombination(sel(data.people))}
                >
                    Sortear
                </Button>
            ) : null}
            <div style={{ textAlign: 'center' }}>{comb_t}</div>
        </div>
    )
}

export default App
