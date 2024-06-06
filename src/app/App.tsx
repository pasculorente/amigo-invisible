import React, { useState } from 'react'
import { Button, Form, Offcanvas, Tab, Tabs } from 'react-bootstrap'
import readXlsxFile, { Row } from 'read-excel-file'

import './App.css'
import { difference, unions } from './collection_utils'
import { generateColorWheel } from './color_utils'
import { selectCandidates, total_combinations } from './combination_utils'
import { FileFormat } from './help'
import {
    bags_table,
    combination_table,
    exclusions_table,
    split_filter,
    to_table,
} from './table_utils'
import { Person } from './types'

function load_data(data: string[][]): { people: Person[]; years: string[] } {
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

function read_rows(rows: Row[]): string[][] {
    return rows.map(row => row.map(cell => cell.toString()))
}

function load_csv(content: string):{ people: Person[]; years: string[] } {
    return load_data(to_table(content))

}
function load_xlsx(rows: Row[]): { people: Person[]; years: string[] } {
    return load_data(read_rows(rows))
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
        if (file.name.endsWith(".csv")) {
            const reader = new FileReader()
            reader.onload = () => {
                const content = load_csv(reader.result! as string)
                setData(content)
                total_combinations(content.people).then((comb) =>
                    setTotalCombinations(comb)
                )
            }
            reader.readAsText(file)
        } else if (file.name.endsWith(".xlsx")) {
            readXlsxFile(file).then((rows) => {
                const content = load_xlsx(rows)
                setData(content)
                total_combinations(content.people).then((comb) =>
                    setTotalCombinations(comb)
                )
            })

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
                        <div className="input-container">
                            <Form.Control
                                type="file"
                                size="sm"
                                name="inputFile"
                                onChange={load}
                            />
                            <Button
                                style={{
                                    marginLeft: '1rem',
                                    marginBottom: '0',
                                }}
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
                {bags_t ? (
                    <Tab title="Opciones" eventKey="options">
                        {bags_t}
                    </Tab>
                ) : null}
            </Tabs>
            <div className="combinations-container">
                {totalCombinations.toLocaleString() + ' combinaciones'}
            </div>
            {data ? (
                <Button
                    id="btn"
                    onClick={() =>
                        setCombination(selectCandidates(data.people))
                    }
                >
                    Sortear
                </Button>
            ) : null}
            <div className="combinations-table-container">{comb_t}</div>
        </div>
    )
}

export default App
