export function FileFormat(
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
