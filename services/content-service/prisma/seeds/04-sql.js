const vikingosTable = {
  name: 'vikingos',
  columns: ['id', 'nombre', 'edad', 'aldea_id'],
  rows: [
    [1, 'Ragnar', 45, 1],
    [2, 'Lagertha', 40, 1],
    [3, 'Bjorn', 25, 2],
    [4, 'Floki', 38, 2],
    [5, 'Ivar', 19, 1],
  ],
};
const aldeasTable = {
  name: 'aldeas',
  columns: ['id', 'nombre'],
  rows: [
    [1, 'Kattegat'],
    [2, 'Hedeby'],
  ],
};
const bothTables = [vikingosTable, aldeasTable];

const missingFrom = {
  pattern: '(?i)^\\s*select((?!from).)*$',
  message: 'Te falta FROM para indicar de qué tabla leer.',
};
const quotedNumber = {
  pattern: "(?i)(edad|id|aldea_id)\\s*[<>=]+\\s*'[0-9]+'",
  message: 'Los números no van entre comillas.',
};
const equalsWithWildcard = {
  pattern: "=\\s*'[^']*%",
  message: 'Para buscar con comodines (%) se usa LIKE, no =.',
};
const whereAfterOrderBy = {
  pattern: '(?i)order\\s+by.*where',
  message: 'WHERE va antes de ORDER BY.',
};
const joinWithoutOn = {
  pattern: '(?i)join\\s+\\w+(\\s+\\w+)?\\s*;?\\s*$',
  message: 'Un JOIN necesita ON para indicar cómo se relacionan las tablas.',
};
const modifyWithoutWhere = {
  pattern: '(?i)^\\s*(update|delete)((?!where).)*$',
  message: '¡Cuidado! Un UPDATE o DELETE sin WHERE afecta a TODAS las filas de la tabla.',
};

export const sqlZone = {
  order: 4,
  slug: 'sql',
  name: 'SQL',
  description:
    'Consultá y modificá datos: SELECT, WHERE, ORDER BY, GROUP BY, JOIN, INSERT, UPDATE y DELETE.',
  videoUrl: null,
  theorySummary: `## Tablas

Una **tabla** guarda datos en **filas** (cada vikingo) y **columnas** (nombre, edad...).

## Consultar

\`\`\`sql
SELECT nombre, edad FROM vikingos WHERE edad > 30 ORDER BY edad DESC LIMIT 2;
\`\`\`

- \`SELECT\` elige columnas, \`FROM\` la tabla.
- \`WHERE\` filtra filas: \`=\`, \`<>\`, \`>\`, \`AND\`, \`OR\`, \`LIKE 'L%'\`, \`IN (...)\`, \`BETWEEN\`.
- \`ORDER BY\` ordena (\`ASC\` / \`DESC\`) y \`LIMIT\` corta.

## Agrupar

\`\`\`sql
SELECT aldea_id, COUNT(*) FROM vikingos GROUP BY aldea_id HAVING COUNT(*) > 2;
\`\`\`

## Unir tablas

\`\`\`sql
SELECT v.nombre, a.nombre FROM vikingos v INNER JOIN aldeas a ON v.aldea_id = a.id;
\`\`\`

## Modificar

\`\`\`sql
INSERT INTO aldeas (id, nombre) VALUES (3, 'Uppsala');
UPDATE vikingos SET edad = 46 WHERE id = 1;
DELETE FROM vikingos WHERE id = 5;
\`\`\`

⚠️ Un \`UPDATE\` o \`DELETE\` sin \`WHERE\` cambia **todas** las filas.`,
  levels: [
    {
      title: 'Tablas, filas y columnas',
      challenges: [
        {
          type: 'multiple_choice',
          statement: 'Mirá la tabla `vikingos`. ¿Qué representa cada **fila**?',
          payload: {
            tables: [vikingosTable],
            options: [
              { id: 'one-viking', text: 'Un vikingo con todos sus datos' },
              { id: 'one-field', text: 'Un dato, como la edad' },
              { id: 'whole-table', text: 'Toda la tabla' },
            ],
          },
          solution: { correctOptionId: 'one-viking' },
          explanation:
            'Cada fila es un registro: un vikingo. Cada columna es un dato de ese vikingo.',
          commonErrors: [{ pattern: '^one-field$', message: 'Eso es una columna.' }],
          hints: ['Las filas son horizontales.'],
        },
        {
          type: 'fill_code',
          statement: 'Mirá la tabla `vikingos` y completá con la cantidad de columnas que tiene.',
          payload: {
            mode: 'blanks',
            template: '-- La tabla vikingos tiene {{0}} columnas',
            tables: [vikingosTable],
          },
          solution: { blanks: [['4', 'cuatro']] },
          explanation: 'Tiene 4 columnas: id, nombre, edad y aldea_id. Las 5 son las filas.',
          commonErrors: [{ pattern: '^5$', message: '5 son las filas. Contá los encabezados.' }],
          hints: ['Contá los encabezados de la tabla.'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Para qué sirve la columna `id`?',
          payload: {
            tables: [vikingosTable],
            options: [
              { id: 'identify', text: 'Para identificar cada fila de forma única' },
              { id: 'age', text: 'Para guardar la edad' },
              { id: 'decorate', text: 'Es decorativa' },
            ],
          },
          solution: { correctOptionId: 'identify' },
          explanation:
            'El id (clave primaria) distingue a cada fila, aunque dos vikingos se llamen igual.',
          commonErrors: [
            { pattern: '^decorate$', message: 'El id es fundamental: identifica cada fila.' },
          ],
          hints: ['¿Qué pasa si hay dos vikingos llamados Ragnar?'],
        },
        {
          type: 'multiple_choice',
          statement: 'La columna `aldea_id` de `vikingos` guarda un número. ¿A qué se refiere?',
          payload: {
            tables: bothTables,
            options: [
              { id: 'foreign', text: 'Al id de una fila de la tabla aldeas' },
              { id: 'age', text: 'A la edad del vikingo' },
              { id: 'count', text: 'A la cantidad de aldeas' },
            ],
          },
          solution: { correctOptionId: 'foreign' },
          explanation: 'aldea_id es una clave foránea: relaciona cada vikingo con su aldea.',
          commonErrors: [
            { pattern: '^count$', message: 'Mirá los valores: 1 y 2 coinciden con ids de aldeas.' },
          ],
          hints: ['Compará los valores con la tabla aldeas.'],
        },
        {
          type: 'multiple_choice',
          statement: '¿En qué aldea vive Floki?',
          payload: {
            tables: bothTables,
            options: [
              { id: 'hedeby', text: 'Hedeby' },
              { id: 'kattegat', text: 'Kattegat' },
            ],
          },
          solution: { correctOptionId: 'hedeby' },
          explanation: 'Floki tiene aldea_id = 2 y la aldea con id 2 es Hedeby.',
          commonErrors: [
            { pattern: '^kattegat$', message: 'Buscá el aldea_id de Floki en la tabla aldeas.' },
          ],
          hints: ['Fijate el aldea_id de Floki.', 'Buscá ese id en aldeas.'],
        },
      ],
    },
    {
      title: 'SELECT y FROM',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Escribí la consulta que trae la columna `nombre` de todos los vikingos.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: {
              columns: ['nombre'],
              rows: [['Ragnar'], ['Lagertha'], ['Bjorn'], ['Floki'], ['Ivar']],
            },
          },
          solution: { accepted: ['SELECT nombre FROM vikingos;'] },
          explanation: 'SELECT elige la columna y FROM indica la tabla.',
          commonErrors: [missingFrom],
          hints: ['Empieza con SELECT.', 'SELECT columna FROM tabla'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para traer **todas** las columnas de `aldeas`.',
          payload: {
            mode: 'blanks',
            template: 'SELECT {{0}} FROM aldeas;',
            tables: [aldeasTable],
            expectedResult: aldeasTable,
          },
          solution: { blanks: [['*']] },
          explanation: 'El asterisco * significa "todas las columnas".',
          commonErrors: [
            { pattern: '(?i)^all$', message: 'En SQL "todas las columnas" se escribe con *.' },
          ],
          hints: ['Es un solo símbolo.'],
        },
        {
          type: 'fill_code',
          statement: 'Traé `nombre` y `edad` de los vikingos, en ese orden.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: {
              columns: ['nombre', 'edad'],
              rows: [
                ['Ragnar', 45],
                ['Lagertha', 40],
                ['Bjorn', 25],
                ['Floki', 38],
                ['Ivar', 19],
              ],
            },
          },
          solution: { accepted: ['SELECT nombre, edad FROM vikingos;'] },
          explanation: 'Las columnas se separan con coma.',
          commonErrors: [
            missingFrom,
            { pattern: '(?i)nombre\\s+edad', message: 'Separá las columnas con una coma.' },
          ],
          hints: ['Separá las columnas con coma.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá el alias para que la columna se muestre como `vikingo`.',
          payload: {
            mode: 'blanks',
            template: 'SELECT nombre {{0}} vikingo FROM vikingos;',
            tables: [vikingosTable],
          },
          solution: { blanks: [['AS']] },
          explanation: 'AS le pone otro nombre (alias) a la columna en el resultado.',
          commonErrors: [{ pattern: '=', message: 'Para un alias se usa AS.' }],
          hints: ['Son dos letras.'],
        },
        {
          type: 'find_bug',
          statement: '¿Qué línea tiene el error en esta consulta?',
          payload: {
            tables: [aldeasTable],
            lines: ['SELECT nombre', 'aldeas;'],
            fixOptions: [
              { id: 'add-from', text: 'Agregar FROM: FROM aldeas;' },
              { id: 'add-where', text: 'Agregar WHERE' },
              { id: 'remove-select', text: 'Sacar SELECT' },
            ],
          },
          solution: { bugLine: 1, fixOptionId: 'add-from' },
          explanation: 'Falta FROM antes del nombre de la tabla.',
          commonErrors: [{ pattern: '^0:', message: 'SELECT nombre está bien.' }],
          hints: ['¿Cómo se indica la tabla?'],
        },
      ],
    },
    {
      title: 'Filtrar con WHERE',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Traé el `nombre` de los vikingos con más de 30 años.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: { columns: ['nombre'], rows: [['Ragnar'], ['Lagertha'], ['Floki']] },
          },
          solution: { accepted: ['SELECT nombre FROM vikingos WHERE edad > 30;'] },
          explanation: 'WHERE filtra las filas que cumplen la condición.',
          commonErrors: [quotedNumber, missingFrom],
          hints: ['Usá WHERE después de FROM.', 'La condición es edad > 30.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para traer los vikingos cuyo nombre empieza con L.',
          payload: {
            mode: 'blanks',
            template: "SELECT nombre FROM vikingos WHERE nombre {{0}} 'L%';",
            tables: [vikingosTable],
            expectedResult: { columns: ['nombre'], rows: [['Lagertha']] },
          },
          solution: { blanks: [['LIKE']] },
          explanation: 'LIKE compara con un patrón; % significa "cualquier cosa".',
          commonErrors: [
            {
              pattern: '^=$',
              message: 'Con = se busca el texto exacto "L%". Para patrones se usa LIKE.',
            },
          ],
          hints: ['Es la palabra para "parecido a".'],
        },
        {
          type: 'fill_code',
          statement: 'Traé el `nombre` de los vikingos de la aldea 1 que tengan menos de 42 años.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: { columns: ['nombre'], rows: [['Lagertha'], ['Ivar']] },
          },
          solution: {
            accepted: [
              'SELECT nombre FROM vikingos WHERE aldea_id = 1 AND edad < 42;',
              'SELECT nombre FROM vikingos WHERE edad < 42 AND aldea_id = 1;',
            ],
          },
          explanation: 'AND exige que se cumplan las dos condiciones.',
          commonErrors: [
            quotedNumber,
            equalsWithWildcard,
            {
              pattern: '(?i)\\sor\\s',
              message: 'OR alcanza con una condición; acá se tienen que cumplir las dos (AND).',
            },
          ],
          hints: ['Necesitás dos condiciones.', 'Unilas con AND.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para traer los vikingos con id 1, 3 o 5.',
          payload: {
            mode: 'blanks',
            template: 'SELECT nombre FROM vikingos WHERE id {{0}} (1, 3, 5);',
            tables: [vikingosTable],
            expectedResult: { columns: ['nombre'], rows: [['Ragnar'], ['Bjorn'], ['Ivar']] },
          },
          solution: { blanks: [['IN']] },
          explanation: 'IN compara contra una lista de valores.',
          commonErrors: [
            {
              pattern: '^=$',
              message: '= compara contra un solo valor; para una lista se usa IN.',
            },
          ],
          hints: ['Dos letras: "dentro de".'],
        },
        {
          type: 'predict_output',
          statement:
            'Mirá la tabla. ¿Qué nombres devuelve esta consulta? Escribí uno por línea, en el orden de la tabla.',
          payload: {
            tables: [vikingosTable],
            code: 'SELECT nombre FROM vikingos WHERE edad BETWEEN 20 AND 40;',
          },
          solution: { output: 'Lagertha\nBjorn\nFloki' },
          explanation: 'BETWEEN 20 AND 40 incluye los extremos: 40, 25 y 38.',
          commonErrors: [{ pattern: 'Ivar', message: 'Ivar tiene 19: queda afuera.' }],
          hints: ['BETWEEN incluye los extremos.'],
        },
      ],
    },
    {
      title: 'Ordenar y limitar',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Traé el `nombre` de los vikingos ordenados por edad de mayor a menor.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: {
              columns: ['nombre'],
              rows: [['Ragnar'], ['Lagertha'], ['Floki'], ['Bjorn'], ['Ivar']],
            },
          },
          solution: { accepted: ['SELECT nombre FROM vikingos ORDER BY edad DESC;'] },
          explanation: 'ORDER BY ordena; DESC es de mayor a menor.',
          commonErrors: [
            {
              pattern: '(?i)order\\s+by\\s+edad\\s*(asc)?\\s*;?\\s*$',
              message: 'Por defecto ordena de menor a mayor. Agregá DESC.',
            },
            whereAfterOrderBy,
            missingFrom,
          ],
          hints: ['Usá ORDER BY.', 'De mayor a menor es DESC.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para traer solo los **2** vikingos más viejos.',
          payload: {
            mode: 'blanks',
            template: 'SELECT nombre FROM vikingos ORDER BY edad DESC {{0}} 2;',
            tables: [vikingosTable],
            expectedResult: { columns: ['nombre'], rows: [['Ragnar'], ['Lagertha']] },
          },
          solution: { blanks: [['LIMIT']] },
          explanation: 'LIMIT corta la cantidad de filas del resultado.',
          commonErrors: [
            {
              pattern: '(?i)^top$',
              message: 'TOP es de SQL Server; en este SQL se usa LIMIT al final.',
            },
          ],
          hints: ['Significa "límite".'],
        },
        {
          type: 'find_bug',
          statement: '¿Qué línea está en el lugar equivocado?',
          payload: {
            tables: [vikingosTable],
            lines: ['SELECT nombre', 'FROM vikingos', 'ORDER BY edad', 'WHERE aldea_id = 1;'],
            fixOptions: [
              { id: 'move-where', text: 'Mover WHERE antes de ORDER BY' },
              { id: 'remove-order', text: 'Borrar ORDER BY' },
              { id: 'quotes', text: 'Poner 1 entre comillas' },
            ],
          },
          solution: { bugLine: 3, fixOptionId: 'move-where' },
          explanation: 'El orden de las cláusulas es SELECT, FROM, WHERE, ORDER BY, LIMIT.',
          commonErrors: [{ pattern: ':quotes$', message: 'Los números no van entre comillas.' }],
          hints: ['El orden de las cláusulas importa.'],
        },
        {
          type: 'order_blocks',
          statement: 'Ordená las cláusulas de la consulta.',
          payload: {
            tables: [vikingosTable],
            blocks: [
              { id: 'k', code: 'SELECT nombre' },
              { id: 'r', code: 'FROM vikingos' },
              { id: 'b', code: 'WHERE edad > 20' },
              { id: 'x', code: 'ORDER BY nombre ASC' },
              { id: 'm', code: 'LIMIT 3;' },
            ],
            expectedOutput: 'Bjorn\nFloki\nLagertha',
          },
          solution: { validOrders: [['k', 'r', 'b', 'x', 'm']] },
          explanation: 'SELECT → FROM → WHERE → ORDER BY → LIMIT.',
          commonErrors: [{ pattern: '^k,r,x', message: 'WHERE va antes de ORDER BY.' }],
          hints: ['Empieza con SELECT y termina con LIMIT.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué nombre devuelve esta consulta?',
          payload: {
            tables: [vikingosTable],
            code: 'SELECT nombre FROM vikingos ORDER BY edad ASC LIMIT 1;',
          },
          solution: { output: 'Ivar' },
          explanation: 'Ordena de menor a mayor edad y se queda con el primero: Ivar (19).',
          commonErrors: [{ pattern: 'Ragnar', message: 'ASC es de menor a mayor.' }],
          hints: ['¿Quién es el más joven?'],
        },
      ],
    },
    {
      title: 'Agrupar',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Escribí la consulta que cuenta cuántos vikingos hay.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: { columns: ['count'], rows: [[5]] },
          },
          solution: { accepted: ['SELECT COUNT(*) FROM vikingos;'] },
          explanation: 'COUNT(*) cuenta las filas.',
          commonErrors: [missingFrom],
          hints: ['Usá la función COUNT.', 'COUNT(*) cuenta todas las filas.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para calcular el **promedio** de edad.',
          payload: {
            mode: 'blanks',
            template: 'SELECT {{0}}(edad) FROM vikingos;',
            tables: [vikingosTable],
            expectedResult: { columns: ['avg'], rows: [[33.4]] },
          },
          solution: { blanks: [['AVG']] },
          explanation: 'AVG calcula el promedio: (45 + 40 + 25 + 38 + 19) / 5 = 33.4.',
          commonErrors: [{ pattern: '(?i)^sum$', message: 'SUM suma; el promedio es AVG.' }],
          hints: ['Viene de "average".'],
        },
        {
          type: 'fill_code',
          statement: 'Contá cuántos vikingos hay en cada aldea (mostrá `aldea_id` y la cantidad).',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: [vikingosTable],
            expectedResult: {
              columns: ['aldea_id', 'count'],
              rows: [
                [1, 3],
                [2, 2],
              ],
            },
          },
          solution: { accepted: ['SELECT aldea_id, COUNT(*) FROM vikingos GROUP BY aldea_id;'] },
          explanation: 'GROUP BY junta las filas por aldea y COUNT cuenta cada grupo.',
          commonErrors: [
            {
              pattern: '(?i)^((?!group).)*$',
              message: 'Para contar por aldea necesitás GROUP BY aldea_id.',
            },
          ],
          hints: ['Necesitás GROUP BY.', 'Agrupá por aldea_id.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para mostrar solo las aldeas con **más de 2** vikingos.',
          payload: {
            mode: 'blanks',
            template:
              'SELECT aldea_id, COUNT(*) FROM vikingos GROUP BY aldea_id {{0}} COUNT(*) > 2;',
            tables: [vikingosTable],
            expectedResult: { columns: ['aldea_id', 'count'], rows: [[1, 3]] },
          },
          solution: { blanks: [['HAVING']] },
          explanation: 'HAVING filtra grupos (WHERE filtra filas antes de agrupar).',
          commonErrors: [
            {
              pattern: '(?i)^where$',
              message: 'WHERE no puede usar COUNT: para filtrar grupos se usa HAVING.',
            },
          ],
          hints: ['No es WHERE.', 'Filtra después de agrupar.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué número devuelve esta consulta?',
          payload: { tables: [vikingosTable], code: 'SELECT MAX(edad) FROM vikingos;' },
          solution: { output: '45' },
          explanation: 'MAX devuelve el valor más grande de la columna.',
          commonErrors: [{ pattern: '^19', message: 'Ese es el mínimo (MIN).' }],
          hints: ['MAX = máximo.'],
        },
      ],
    },
    {
      title: 'JOIN',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Completá la condición del JOIN para unir cada vikingo con su aldea.',
          payload: {
            mode: 'blanks',
            template:
              'SELECT v.nombre, a.nombre\nFROM vikingos v\nINNER JOIN aldeas a ON v.{{0}} = a.{{1}};',
            tables: bothTables,
          },
          solution: { blanks: [['aldea_id'], ['id']] },
          explanation:
            'Se unen las filas donde el aldea_id del vikingo coincide con el id de la aldea.',
          commonErrors: [
            {
              pattern: '^id\\n',
              message: 'Del lado del vikingo la columna que apunta a la aldea es aldea_id.',
            },
          ],
          hints: ['¿Qué columna de vikingos apunta a aldeas?'],
        },
        {
          type: 'fill_code',
          statement:
            'Escribí la consulta que muestra el nombre de cada vikingo y el nombre de su aldea, usando los alias `v` y `a`.',
          payload: {
            mode: 'free',
            starterCode: '',
            tables: bothTables,
            expectedResult: {
              columns: ['nombre', 'nombre'],
              rows: [
                ['Ragnar', 'Kattegat'],
                ['Lagertha', 'Kattegat'],
                ['Bjorn', 'Hedeby'],
                ['Floki', 'Hedeby'],
                ['Ivar', 'Kattegat'],
              ],
            },
          },
          solution: {
            accepted: [
              'SELECT v.nombre, a.nombre FROM vikingos v INNER JOIN aldeas a ON v.aldea_id = a.id;',
              'SELECT v.nombre, a.nombre FROM vikingos v JOIN aldeas a ON v.aldea_id = a.id;',
              'SELECT v.nombre, a.nombre FROM vikingos v INNER JOIN aldeas a ON a.id = v.aldea_id;',
            ],
            requiredTokens: ['SELECT', 'FROM vikingos v', 'JOIN aldeas a ON', 'aldea_id'],
          },
          explanation: 'INNER JOIN combina filas de las dos tablas que cumplen la condición ON.',
          commonErrors: [joinWithoutOn, missingFrom],
          hints: [
            'FROM vikingos v INNER JOIN aldeas a',
            'Falta la condición ON.',
            'ON v.aldea_id = a.id',
          ],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué diferencia hay entre INNER JOIN y LEFT JOIN?',
          payload: {
            options: [
              {
                id: 'left-keeps',
                text: 'LEFT JOIN conserva todas las filas de la tabla izquierda aunque no tengan pareja',
              },
              { id: 'same', text: 'Son exactamente iguales' },
              { id: 'left-faster', text: 'LEFT JOIN siempre es más rápido' },
            ],
          },
          solution: { correctOptionId: 'left-keeps' },
          explanation:
            'Con LEFT JOIN, si una fila de la izquierda no tiene pareja, aparece igual con NULL en las columnas de la derecha.',
          commonErrors: [
            { pattern: '^same$', message: 'Difieren en qué pasa con las filas sin pareja.' },
          ],
          hints: ['Pensá en una aldea sin vikingos.'],
        },
        {
          type: 'find_bug',
          statement: '¿Qué línea tiene el error?',
          payload: {
            tables: bothTables,
            lines: ['SELECT v.nombre, a.nombre', 'FROM vikingos v', 'INNER JOIN aldeas a;'],
            fixOptions: [
              { id: 'add-on', text: 'Agregar ON v.aldea_id = a.id' },
              { id: 'remove-alias', text: 'Sacar los alias' },
              { id: 'use-where', text: 'Cambiar INNER JOIN por WHERE' },
            ],
          },
          solution: { bugLine: 2, fixOptionId: 'add-on' },
          explanation: 'Todo INNER JOIN necesita la condición ON.',
          commonErrors: [{ pattern: '^1:', message: 'FROM vikingos v está bien.' }],
          hints: ['¿Cómo sabe SQL qué filas unir?'],
        },
        {
          type: 'predict_output',
          statement: '¿Cuántas filas devuelve esta consulta?',
          payload: {
            tables: bothTables,
            code: "SELECT v.nombre FROM vikingos v INNER JOIN aldeas a ON v.aldea_id = a.id WHERE a.nombre = 'Hedeby';",
          },
          solution: { output: '2' },
          explanation: 'En Hedeby (id 2) viven Bjorn y Floki.',
          commonErrors: [{ pattern: '^3', message: 'Esos son los de Kattegat.' }],
          hints: ['¿Qué id tiene Hedeby?', 'Contá los vikingos con ese aldea_id.'],
        },
      ],
    },
    {
      title: 'Modificar datos',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Insertá la aldea `Uppsala` con id 3 en la tabla `aldeas`.',
          payload: { mode: 'free', starterCode: '', tables: [aldeasTable] },
          solution: {
            accepted: [
              "INSERT INTO aldeas (id, nombre) VALUES (3, 'Uppsala');",
              "INSERT INTO aldeas VALUES (3, 'Uppsala');",
            ],
          },
          explanation: 'INSERT INTO tabla (columnas) VALUES (valores);',
          commonErrors: [
            {
              pattern: '(?i)values\\s*\\(\\s*3\\s*,\\s*uppsala',
              message: 'Los textos van entre comillas simples.',
            },
            { pattern: '(?i)^insert\\s+aldeas', message: 'Falta INTO: INSERT INTO aldeas ...' },
          ],
          hints: [
            'INSERT INTO aldeas ...',
            'VALUES (3, ...)',
            'El texto va entre comillas simples.',
          ],
        },
        {
          type: 'fill_code',
          statement: 'Completá para cambiar la edad de Ragnar (id 1) a 46.',
          payload: {
            mode: 'blanks',
            template: 'UPDATE vikingos {{0}} edad = 46 {{1}} id = 1;',
            tables: [vikingosTable],
          },
          solution: { blanks: [['SET'], ['WHERE']] },
          explanation: 'UPDATE tabla SET columna = valor WHERE condición;',
          commonErrors: [modifyWithoutWhere],
          hints: ['Primero SET, después la condición.'],
        },
        {
          type: 'fill_code',
          statement: 'Borrá al vikingo con id 5.',
          payload: { mode: 'free', starterCode: '', tables: [vikingosTable] },
          solution: { accepted: ['DELETE FROM vikingos WHERE id = 5;'] },
          explanation: 'DELETE FROM tabla WHERE condición; El WHERE evita borrar todo.',
          commonErrors: [modifyWithoutWhere, quotedNumber],
          hints: ['DELETE FROM vikingos ...', '¡No te olvides del WHERE!'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué pasa si ejecutás `DELETE FROM vikingos;`?',
          payload: {
            options: [
              { id: 'all', text: 'Se borran TODAS las filas de la tabla' },
              { id: 'first', text: 'Se borra solo la primera fila' },
              { id: 'error', text: 'Da error siempre' },
            ],
          },
          solution: { correctOptionId: 'all' },
          explanation: 'Sin WHERE, DELETE afecta a todas las filas. ¡Cuidado!',
          commonErrors: [
            { pattern: '^first$', message: 'Sin WHERE no hay filtro: afecta a todas.' },
          ],
          hints: ['No tiene WHERE...'],
        },
        {
          type: 'order_blocks',
          statement:
            'Ordená la instrucción que sube 1 año la edad de los vikingos de Hedeby (aldea 2).',
          payload: {
            tables: [vikingosTable],
            blocks: [
              { id: 'q', code: 'UPDATE vikingos' },
              { id: 'z', code: 'SET edad = edad + 1' },
              { id: 'w', code: 'WHERE aldea_id = 2;' },
            ],
          },
          solution: { validOrders: [['q', 'z', 'w']] },
          explanation: 'UPDATE → SET → WHERE.',
          commonErrors: [{ pattern: '^z', message: 'Primero se indica qué tabla se actualiza.' }],
          hints: ['Empieza con UPDATE.'],
        },
      ],
    },
  ],
};
