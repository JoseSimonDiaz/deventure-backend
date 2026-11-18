export const logicZone = {
  order: 1,
  slug: 'logica-basica',
  name: 'Lógica básica',
  description: 'Tus primeros pasos: qué es un programa, variables, tipos, operadores y decisiones.',
  videoUrl: null,
  theorySummary: `## ¿Qué es un programa?

Un **programa** es una lista de instrucciones que la computadora sigue **en orden**, como una receta. Si cambiás el orden, cambia el resultado.

## Variables

Una **variable** es un cofre con nombre donde guardás un dato para usarlo después:

\`\`\`
edad = 18
nombre = "Björn"
\`\`\`

## Tipos de datos

- **Número**: \`18\`, \`3.5\`
- **Texto**: \`"Hola"\` (siempre entre comillas)
- **Verdadero/Falso**: \`verdadero\`, \`falso\`

## Operadores

- Aritméticos: \`+ - * /\`
- De comparación: \`> < == !=\` (el resultado es verdadero o falso)

## Decisiones

\`\`\`
si edad >= 18 entonces
  mostrar "Podés navegar solo"
sino
  mostrar "Necesitás un adulto"
fin si
\`\`\``,
  levels: [
    {
      title: '¿Qué es un programa?',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Qué es un programa?',
          payload: {
            options: [
              {
                id: 'instructions',
                text: 'Una lista de instrucciones que la computadora sigue en orden',
              },
              { id: 'screen', text: 'La pantalla de la computadora' },
              { id: 'internet', text: 'Una página de internet' },
            ],
          },
          solution: { correctOptionId: 'instructions' },
          explanation:
            'Un programa es una lista de instrucciones. La computadora las ejecuta una por una, en el orden en que están escritas.',
          commonErrors: [
            {
              pattern: '^screen$',
              message: 'La pantalla solo muestra resultados; el programa son las instrucciones.',
            },
          ],
          hints: ['Pensá en una receta de cocina.', 'Una receta es una lista de pasos en orden.'],
        },
        {
          type: 'order_blocks',
          statement: 'Björn quiere zarpar con su barco. Ordená los pasos para que pueda hacerlo.',
          payload: {
            blocks: [
              { id: 'k', code: 'subir al barco' },
              { id: 'r', code: 'desatar la cuerda' },
              { id: 'b', code: 'remar' },
            ],
          },
          solution: { validOrders: [['k', 'r', 'b']] },
          explanation:
            'Primero sube al barco, después desata la cuerda y recién ahí puede remar. En un programa el orden de las instrucciones importa.',
          commonErrors: [{ pattern: '^b', message: '¿Se puede remar antes de subir al barco?' }],
          hints: [
            '¿Qué tiene que pasar antes de remar?',
            'No se puede remar si el barco sigue atado.',
          ],
        },
        {
          type: 'multiple_choice',
          statement: 'Si en un programa cambiás el orden de las instrucciones, ¿qué puede pasar?',
          payload: {
            options: [
              { id: 'same', text: 'Nada, la computadora las acomoda sola' },
              { id: 'different', text: 'El resultado puede ser distinto' },
              { id: 'faster', text: 'El programa siempre va más rápido' },
            ],
          },
          solution: { correctOptionId: 'different' },
          explanation:
            'La computadora no adivina: sigue las instrucciones exactamente en el orden en que las escribiste.',
          commonErrors: [
            {
              pattern: '^same$',
              message: 'La computadora no reordena nada: hace lo que le decís, en orden.',
            },
          ],
          hints: ['¿La computadora piensa por vos?'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa? Escribí cada línea de la salida.',
          payload: { code: 'mostrar "Hola"\nmostrar "vikingo"' },
          solution: { output: 'Hola\nvikingo' },
          explanation:
            'Las instrucciones se ejecutan de arriba hacia abajo: primero "Hola" y después "vikingo".',
          commonErrors: [{ pattern: '^vikingo', message: 'Fijate cuál instrucción está primero.' }],
          hints: ['Leé el programa de arriba hacia abajo.', 'Cada mostrar escribe una línea.'],
        },
      ],
    },
    {
      title: 'Variables',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Para qué sirve una variable?',
          payload: {
            options: [
              { id: 'store-value', text: 'Para guardar un dato y usarlo después' },
              { id: 'turn-off', text: 'Para apagar la computadora' },
              { id: 'draw', text: 'Para dibujar en la pantalla' },
            ],
          },
          solution: { correctOptionId: 'store-value' },
          explanation:
            'Una variable es como un cofre con nombre: guardás un dato (la edad de un vikingo, su puntaje) y lo usás cuando lo necesitás.',
          commonErrors: [
            { pattern: '^draw$', message: 'Las variables no dibujan: guardan datos.' },
          ],
          hints: ['Pensá en un cofre con una etiqueta.'],
        },
        {
          type: 'fill_code',
          statement: 'Guardá el número 25 en la variable `edad`.',
          payload: { mode: 'blanks', template: 'edad = {{0}}' },
          solution: { blanks: [['25']] },
          explanation: 'Con `=` guardamos el valor de la derecha en la variable de la izquierda.',
          commonErrors: [
            { pattern: '"25"', message: '25 es un número: no hace falta ponerlo entre comillas.' },
          ],
          hints: ['El valor va a la derecha del =.', 'Escribí solo el número.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'oro = 10\noro = 15\nmostrar oro' },
          solution: { output: '15' },
          explanation:
            'Una variable guarda un solo valor a la vez: al asignar 15, el 10 se reemplaza.',
          commonErrors: [
            { pattern: '^10', message: 'La segunda asignación reemplaza el valor anterior.' },
          ],
          hints: ['¿Qué valor tiene oro al final?', 'Cada asignación pisa la anterior.'],
        },
        {
          type: 'find_bug',
          statement:
            'Este programa debería mostrar el nombre del vikingo, pero tiene un error. Encontralo.',
          payload: {
            lines: ['nombre = "Ragnar"', 'mostrar nombr'],
            fixOptions: [
              { id: 'fix-name', text: 'Escribir nombre completo: mostrar nombre' },
              { id: 'remove-quotes', text: 'Quitar las comillas de "Ragnar"' },
            ],
          },
          solution: { bugLine: 1, fixOptionId: 'fix-name' },
          explanation:
            'El nombre de la variable tiene que escribirse exactamente igual cada vez que la usás.',
          commonErrors: [
            { pattern: '^0:', message: 'La primera línea está bien: el texto va entre comillas.' },
          ],
          hints: ['Compará cómo se llama la variable en cada línea.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'flechas = 3\nflechas = flechas + 2\nmostrar flechas' },
          solution: { output: '5' },
          explanation:
            'Primero se calcula flechas + 2 (3 + 2 = 5) y el resultado se guarda otra vez en flechas.',
          commonErrors: [
            { pattern: '^3', message: 'La segunda línea cambia el valor de flechas.' },
          ],
          hints: ['Calculá la derecha del = primero.', '3 + 2 = ?'],
        },
      ],
    },
    {
      title: 'Tipos de datos',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Qué tipo de dato es `"Kattegat"`?',
          payload: {
            options: [
              { id: 'text', text: 'Texto' },
              { id: 'number', text: 'Número' },
              { id: 'boolean', text: 'Verdadero/Falso' },
            ],
          },
          solution: { correctOptionId: 'text' },
          explanation: 'Todo lo que está entre comillas es texto.',
          commonErrors: [{ pattern: '^number$', message: 'Las comillas indican que es texto.' }],
          hints: ['Fijate en las comillas.'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué tipo de dato es `3.5`?',
          payload: {
            options: [
              { id: 'number', text: 'Número' },
              { id: 'text', text: 'Texto' },
              { id: 'boolean', text: 'Verdadero/Falso' },
            ],
          },
          solution: { correctOptionId: 'number' },
          explanation: 'Los números pueden tener decimales y se escriben sin comillas.',
          commonErrors: [{ pattern: '^text$', message: 'No tiene comillas: es un número.' }],
          hints: ['¿Tiene comillas?'],
        },
        {
          type: 'fill_code',
          statement: 'Guardá el texto Björn en la variable `nombre`.',
          payload: { mode: 'blanks', template: 'nombre = {{0}}' },
          solution: { blanks: [['"Björn"', '"Bjorn"']] },
          explanation: 'Los textos siempre van entre comillas dobles.',
          commonErrors: [
            { pattern: '^[^"]', message: 'Un texto tiene que ir entre comillas dobles.' },
          ],
          hints: ['Es un texto.', 'Los textos van entre comillas: "..."'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Cuál de estos datos es de tipo verdadero/falso?',
          payload: {
            options: [
              { id: 'quoted', text: '"verdadero"' },
              { id: 'boolean', text: 'verdadero' },
              { id: 'one', text: '1' },
            ],
          },
          solution: { correctOptionId: 'boolean' },
          explanation: '`verdadero` sin comillas es un valor lógico; con comillas sería un texto.',
          commonErrors: [{ pattern: '^quoted$', message: 'Con comillas se convierte en texto.' }],
          hints: ['Las comillas cambian el tipo.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'a = "5"\nb = "5"\nmostrar a + b' },
          solution: { output: '55' },
          explanation: 'Con textos, el + los une (concatena): "5" + "5" = "55".',
          commonErrors: [
            {
              pattern: '^10',
              message: 'Son textos, no números: el + los pega uno al lado del otro.',
            },
          ],
          hints: ['¿a y b son números o textos?', 'Sumar textos los pega.'],
        },
      ],
    },
    {
      title: 'Operadores',
      challenges: [
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'precio = 20\ncantidad = 3\nmostrar precio * cantidad' },
          solution: { output: '60' },
          explanation: '`*` multiplica: 20 × 3 = 60.',
          commonErrors: [{ pattern: '^23', message: 'El * multiplica, no suma.' }],
          hints: ['* es multiplicar.'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué resultado da `10 > 7`?',
          payload: {
            options: [
              { id: 'true', text: 'verdadero' },
              { id: 'false', text: 'falso' },
              { id: 'three', text: '3' },
            ],
          },
          solution: { correctOptionId: 'true' },
          explanation:
            'Los operadores de comparación dan verdadero o falso. 10 es mayor que 7, entonces es verdadero.',
          commonErrors: [
            {
              pattern: '^three$',
              message: 'Comparar no es restar: el resultado es verdadero o falso.',
            },
          ],
          hints: ['> significa "mayor que".'],
        },
        {
          type: 'fill_code',
          statement: 'Completá con el operador que compara si dos valores son **iguales**.',
          payload: { mode: 'blanks', template: 'puntos {{0}} 100' },
          solution: { blanks: [['==']] },
          explanation: '`==` compara si son iguales; `=` en cambio guarda un valor.',
          commonErrors: [
            { pattern: '^=$', message: 'Un solo = guarda un valor. Para comparar se usan dos: ==' },
          ],
          hints: ['No es el mismo signo que para guardar.', 'Son dos signos iguales.'],
        },
        {
          type: 'multiple_choice',
          statement: 'La temperatura es 5. ¿Qué da `temperatura != 5`?',
          payload: {
            options: [
              { id: 'false', text: 'falso' },
              { id: 'true', text: 'verdadero' },
            ],
          },
          solution: { correctOptionId: 'false' },
          explanation:
            '`!=` significa "distinto de". Como la temperatura es 5, no es distinta: falso.',
          commonErrors: [
            { pattern: '^true$', message: '!= pregunta si son distintos. ¿5 es distinto de 5?' },
          ],
          hints: ['!= es "distinto de".'],
        },
        {
          type: 'order_blocks',
          statement:
            'Ordená el programa para calcular y mostrar el total de una compra de 2 escudos de 15 monedas.',
          payload: {
            blocks: [
              { id: 'm', code: 'precio = 15' },
              { id: 'x', code: 'cantidad = 2' },
              { id: 't', code: 'total = precio * cantidad' },
              { id: 'f', code: 'mostrar total' },
            ],
            expectedOutput: '30',
          },
          solution: {
            validOrders: [
              ['m', 'x', 't', 'f'],
              ['x', 'm', 't', 'f'],
            ],
          },
          explanation:
            'Primero se guardan los datos, después se calcula y al final se muestra. Precio y cantidad pueden ir en cualquier orden.',
          commonErrors: [
            { pattern: '^f', message: 'No se puede mostrar el total antes de calcularlo.' },
          ],
          hints: ['Antes de calcular necesitás los datos.', 'Mostrar va al final.'],
        },
      ],
    },
    {
      title: 'Condicionales',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Para qué sirve `si ... entonces`?',
          payload: {
            options: [
              {
                id: 'decide',
                text: 'Para que el programa haga algo solo si se cumple una condición',
              },
              { id: 'repeat', text: 'Para repetir algo muchas veces' },
              { id: 'store', text: 'Para guardar un dato' },
            ],
          },
          solution: { correctOptionId: 'decide' },
          explanation:
            'Un condicional permite tomar decisiones: si la condición es verdadera, se ejecuta un bloque.',
          commonErrors: [
            { pattern: '^repeat$', message: 'Repetir es trabajo de los bucles; el si decide.' },
          ],
          hints: ['Pensá en "si llueve, llevo paraguas".'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'edad = 15\nsi edad >= 18 entonces\n  mostrar "Navegás solo"\nsino\n  mostrar "Necesitás un adulto"\nfin si',
          },
          solution: { output: 'Necesitás un adulto' },
          explanation: '15 no es mayor o igual a 18, entonces se ejecuta el bloque del sino.',
          commonErrors: [{ pattern: 'solo', message: '¿15 es mayor o igual que 18?' }],
          hints: ['Evaluá la condición con edad = 15.', 'Si es falsa, va por el sino.'],
        },
        {
          type: 'fill_code',
          statement:
            'Completá la condición para mostrar "¡Ganaste!" cuando los puntos sean mayores a 50.',
          payload: {
            mode: 'blanks',
            template: 'si puntos {{0}} 50 entonces\n  mostrar "¡Ganaste!"\nfin si',
          },
          solution: { blanks: [['>']] },
          explanation: '`>` pregunta si el valor de la izquierda es mayor que el de la derecha.',
          commonErrors: [
            { pattern: '^<$', message: 'Ese signo es "menor que". Necesitás "mayor que".' },
          ],
          hints: ['"Mayor que" tiene un signo.', 'La punta mira hacia el número más chico: >'],
        },
        {
          type: 'find_bug',
          statement:
            'Este programa debería avisar que hace frío cuando la temperatura es menor a 10, pero algo está mal.',
          payload: {
            lines: [
              'temperatura = 4',
              'si temperatura > 10 entonces',
              '  mostrar "Hace frío"',
              'fin si',
            ],
            fixOptions: [
              { id: 'fix-less', text: 'Cambiar > por <' },
              { id: 'fix-value', text: 'Cambiar 4 por 40' },
              { id: 'fix-end', text: 'Borrar fin si' },
            ],
          },
          solution: { bugLine: 1, fixOptionId: 'fix-less' },
          explanation: 'Para preguntar si la temperatura es menor a 10 se usa `<`.',
          commonErrors: [
            { pattern: '^0:', message: 'El valor de la temperatura no es el problema.' },
          ],
          hints: ['Mirá la condición.', '¿Queremos mayor o menor que 10?'],
        },
        {
          type: 'order_blocks',
          statement:
            'Armá el programa que muestra "Aprobado" si la nota es 6 o más, y "Desaprobado" si no.',
          payload: {
            blocks: [
              { id: 'q', code: 'nota = 8' },
              { id: 'z', code: 'si nota >= 6 entonces' },
              { id: 'w', code: '  mostrar "Aprobado"' },
              { id: 'k', code: 'sino' },
              { id: 'm', code: '  mostrar "Desaprobado"' },
              { id: 'r', code: 'fin si' },
            ],
            expectedOutput: 'Aprobado',
          },
          solution: { validOrders: [['q', 'z', 'w', 'k', 'm', 'r']] },
          explanation:
            'El dato va primero, después la condición, el bloque del sí, el sino con su bloque y el cierre.',
          commonErrors: [
            { pattern: '^z', message: 'Antes de preguntar por la nota tenés que guardarla.' },
          ],
          hints: ['La variable va primero.', 'sino separa los dos caminos.', 'fin si cierra todo.'],
        },
      ],
    },
  ],
};
