import { Table } from 'react-bootstrap'

function ExampleTable() {
    return (
        <Table>
            <thead>
                <tr>
                    <th>key</th>
                    <th>name</th>
                    <th>excluded</th>
                    <th>2022</th>
                    <th>2023</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>jonh</td>
                    <td>Jonh</td>
                    <td>mary</td>
                    <td>joe</td>
                    <td>john2</td>
                </tr>
                <tr>
                    <td>mary</td>
                    <td>Mary</td>
                    <td>jonh</td>
                    <td>jonh2</td>
                    <td>bob</td>
                </tr>
                <tr>
                    <td>jonh2</td>
                    <td>Jonh D</td>
                    <td>jonh</td>
                    <td>mary</td>
                    <td>joe</td>
                </tr>
                <tr>
                    <td>joe</td>
                    <td>Joe</td>
                    <td></td>
                    <td>jonh</td>
                    <td>mary</td>
                </tr>
            </tbody>
        </Table>
    )
}
export function FileFormat(
    props: { lang?: 'en' | 'es' } = { lang: 'es' }
): React.ReactElement {
    if (props.lang == 'en')
        return (
            <div className="font-size-small">
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
                <ExampleTable />
            </div>
        )
    return (
        <div className="font-size-small">
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
            <ExampleTable />
        </div>
    )
}
