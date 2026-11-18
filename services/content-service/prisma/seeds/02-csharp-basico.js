const missingSemicolon = {
  pattern: '[^;}\\s]\\s*$',
  message: 'Te falta el punto y coma (;) al final de la instrucción.',
};
const lowercaseConsole = {
  pattern: 'console\\.',
  message: 'Console se escribe con C mayúscula.',
};
const misspelledWriteLine = {
  pattern: 'Writeline|writeLine|WriteLn|Consol\\.',
  message: 'Revisá cómo se escribe: Console.WriteLine (con C y L mayúsculas).',
};
const singleQuotesText = {
  pattern: "'[^']{2,}'",
  message: 'En C# los textos van entre comillas dobles ("). Las simples son para un solo carácter.',
};
export const csharpZone = {
  order: 2,
  slug: 'csharp-basico',
  name: 'C# básico',
  description:
    'La sintaxis real de C#: tipos, variables, operadores, decisiones, bucles y métodos.',
  videoUrl: null,
  theorySummary: `## Tu primer programa en C#

\`\`\`csharp
using System;

class Programa
{
    static void Main()
    {
        Console.WriteLine("¡Hola, vikingo!");
    }
}
\`\`\`

- Cada instrucción termina con **punto y coma** \`;\`.
- C# distingue mayúsculas: \`Console\` no es lo mismo que \`console\`.

## Tipos y variables

\`\`\`csharp
int edad = 25;          // números enteros
double peso = 80.5;     // números con decimales
string nombre = "Ragnar"; // texto, entre comillas dobles
bool esJarl = true;     // verdadero o falso
var aldea = "Kattegat"; // C# deduce el tipo
\`\`\`

## Decisiones y bucles

\`\`\`csharp
if (edad >= 18) { Console.WriteLine("Adulto"); } else { Console.WriteLine("Menor"); }

for (int i = 1; i <= 3; i++) { Console.WriteLine(i); }
\`\`\`

## Métodos

\`\`\`csharp
static int Sumar(int a, int b)
{
    return a + b;
}
\`\`\``,
  levels: [
    {
      title: 'Tu primer programa',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Qué instrucción muestra un texto en la consola en C#?',
          payload: {
            options: [
              { id: 'writeline', text: 'Console.WriteLine("Hola");' },
              { id: 'print', text: 'print("Hola")' },
              { id: 'echo', text: 'echo "Hola";' },
            ],
          },
          solution: { correctOptionId: 'writeline' },
          explanation: 'En C# se usa Console.WriteLine(...) para escribir una línea en la consola.',
          commonErrors: [
            { pattern: '^print$', message: 'print es de otros lenguajes, como Python.' },
          ],
          hints: ['Empieza con Console.'],
        },
        {
          type: 'fill_code',
          statement: 'Escribí la instrucción que muestra **Hola, mundo** en la consola.',
          payload: { mode: 'free', starterCode: '' },
          solution: {
            accepted: ['Console.WriteLine("Hola, mundo");', 'Console.WriteLine("Hola mundo");'],
          },
          explanation:
            'Console.WriteLine recibe el texto entre comillas dobles y la instrucción termina en ;',
          commonErrors: [lowercaseConsole, misspelledWriteLine, singleQuotesText, missingSemicolon],
          hints: [
            'Usá Console.WriteLine(...).',
            'El texto va entre comillas dobles.',
            'No te olvides del ; al final.',
          ],
        },
        {
          type: 'find_bug',
          statement: 'Este programa no compila. ¿Dónde está el error?',
          payload: {
            lines: ['static void Main()', '{', '    Console.WriteLine("Skål")', '}'],
            fixOptions: [
              { id: 'semicolon', text: 'Agregar ; al final de la línea' },
              { id: 'lowercase', text: 'Escribir console en minúscula' },
              { id: 'braces', text: 'Sacar las llaves' },
            ],
          },
          solution: { bugLine: 2, fixOptionId: 'semicolon' },
          explanation: 'Cada instrucción en C# termina con punto y coma.',
          commonErrors: [{ pattern: '^0:', message: 'La declaración de Main está bien.' }],
          hints: ['Mirá el final de cada instrucción.'],
        },
        {
          type: 'order_blocks',
          statement: 'Ordená las líneas para formar un programa completo de C#.',
          payload: {
            blocks: [
              { id: 'k', code: 'class Programa' },
              { id: 'r', code: '{' },
              { id: 'b', code: '    static void Main()' },
              { id: 'x', code: '    {' },
              { id: 'm', code: '        Console.WriteLine("¡Al Valhalla!");' },
              { id: 't', code: '    }' },
              { id: 'f', code: '}' },
            ],
            expectedOutput: '¡Al Valhalla!',
          },
          solution: { validOrders: [['k', 'r', 'b', 'x', 'm', 't', 'f']] },
          explanation:
            'La clase contiene al método Main, y Main contiene la instrucción. Cada llave que se abre se cierra.',
          commonErrors: [
            { pattern: '^b', message: 'Main vive dentro de una clase: la clase va primero.' },
          ],
          hints: [
            'La clase envuelve todo.',
            'Main va dentro de la clase.',
            'Cerrá las llaves en orden inverso.',
          ],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'Console.WriteLine("Uno");\nConsole.WriteLine("Dos");' },
          solution: { output: 'Uno\nDos' },
          explanation: 'Cada WriteLine escribe una línea, en el orden en que aparecen.',
          commonErrors: [
            { pattern: 'UnoDos', message: 'WriteLine agrega un salto de línea al final.' },
          ],
          hints: ['WriteLine = escribir línea.'],
        },
      ],
    },
    {
      title: 'Tipos y variables',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Qué tipo usarías para guardar el nombre de un barco?',
          payload: {
            options: [
              { id: 'string', text: 'string' },
              { id: 'int', text: 'int' },
              { id: 'bool', text: 'bool' },
            ],
          },
          solution: { correctOptionId: 'string' },
          explanation: 'string guarda texto.',
          commonErrors: [{ pattern: '^int$', message: 'int es para números enteros.' }],
          hints: ['Un nombre es texto.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para declarar una variable entera `edad` con el valor 30.',
          payload: { mode: 'blanks', template: '{{0}} edad = 30;' },
          solution: { blanks: [['int', 'var']] },
          explanation:
            'int es el tipo para números enteros (también podés usar var y C# lo deduce).',
          commonErrors: [{ pattern: '^string$', message: '30 es un número, no un texto.' }],
          hints: ['Es un número entero.', 'El tipo de los enteros tiene 3 letras.'],
        },
        {
          type: 'fill_code',
          statement: 'Declará una variable `string` llamada `aldea` con el valor "Kattegat".',
          payload: { mode: 'free', starterCode: '' },
          solution: {
            accepted: ['string aldea = "Kattegat";', 'var aldea = "Kattegat";'],
          },
          explanation: 'Tipo, nombre, =, valor entre comillas dobles y ; al final.',
          commonErrors: [
            singleQuotesText,
            {
              pattern: '^String',
              message:
                'En C# se usa string en minúscula (String también existe, pero usamos string).',
            },
            missingSemicolon,
          ],
          hints: ['Empezá por el tipo: string.', 'El texto va entre comillas dobles.'],
        },
        {
          type: 'find_bug',
          statement: '¿Cuál línea tiene un error de tipos?',
          payload: {
            lines: [
              'int escudos = 3;',
              'double peso = 72.5;',
              'int edad = "20";',
              'bool esJarl = true;',
            ],
            fixOptions: [
              { id: 'remove-quotes', text: 'Quitar las comillas: int edad = 20;' },
              { id: 'change-bool', text: 'Cambiar true por "true"' },
              { id: 'change-double', text: 'Cambiar double por int' },
            ],
          },
          solution: { bugLine: 2, fixOptionId: 'remove-quotes' },
          explanation:
            'Un int guarda números; "20" entre comillas es un texto y no se puede asignar a un int.',
          commonErrors: [
            { pattern: '^1:', message: 'double acepta decimales: esa línea está bien.' },
          ],
          hints: ['Buscá un número escrito como texto.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'int oro = 10;\noro = oro + 5;\nConsole.WriteLine(oro);' },
          solution: { output: '15' },
          explanation: 'oro empieza en 10 y después se le suman 5.',
          commonErrors: [{ pattern: '^10', message: 'La segunda línea cambia el valor de oro.' }],
          hints: ['Calculá oro + 5.'],
        },
      ],
    },
    {
      title: 'Operadores',
      challenges: [
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'int botin = 17;\nConsole.WriteLine(botin % 5);' },
          solution: { output: '2' },
          explanation: '% da el resto de la división: 17 / 5 = 3 y sobran 2.',
          commonErrors: [{ pattern: '^3', message: '% no es la división: es el resto.' }],
          hints: ['% es el resto de dividir.', '5 × 3 = 15. ¿Cuánto falta para 17?'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué da `(5 > 3) && (2 > 4)`?',
          payload: {
            options: [
              { id: 'false', text: 'false' },
              { id: 'true', text: 'true' },
            ],
          },
          solution: { correctOptionId: 'false' },
          explanation: '&& es "y": las dos partes tienen que ser verdaderas. 2 > 4 es falso.',
          commonErrors: [
            { pattern: '^true$', message: '&& necesita que las DOS condiciones sean verdaderas.' },
          ],
          hints: ['Evaluá cada paréntesis por separado.'],
        },
        {
          type: 'fill_code',
          statement:
            'Completá con el operador "o" lógico para que entre si es jarl **o** tiene más de 50 puntos.',
          payload: { mode: 'blanks', template: 'if (esJarl {{0}} puntos > 50)' },
          solution: { blanks: [['||']] },
          explanation: '|| es el "o" lógico: alcanza con que una condición sea verdadera.',
          commonErrors: [{ pattern: '&&', message: '&& es "y". Para "o" se usa ||.' }],
          hints: ['Son dos barras verticales.'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué da `!true`?',
          payload: {
            options: [
              { id: 'false', text: 'false' },
              { id: 'true', text: 'true' },
              { id: 'error', text: 'Da error' },
            ],
          },
          solution: { correctOptionId: 'false' },
          explanation: '! niega: lo verdadero pasa a falso y viceversa.',
          commonErrors: [
            { pattern: '^error$', message: '! es un operador válido: invierte un bool.' },
          ],
          hints: ['! significa "no".'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'int a = 7;\nint b = 2;\nConsole.WriteLine(a / b);' },
          solution: { output: '3' },
          explanation: 'Dividir dos int da un int: se descarta la parte decimal (3.5 → 3).',
          commonErrors: [
            { pattern: '3[.,]5', message: 'Entre enteros, la división descarta los decimales.' },
          ],
          hints: ['a y b son int.', 'La división entera corta los decimales.'],
        },
      ],
    },
    {
      title: 'Decisiones',
      challenges: [
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'int fuerza = 70;\nif (fuerza > 80)\n{\n    Console.WriteLine("Guerrero");\n}\nelse if (fuerza > 50)\n{\n    Console.WriteLine("Explorador");\n}\nelse\n{\n    Console.WriteLine("Aprendiz");\n}',
          },
          solution: { output: 'Explorador' },
          explanation: '70 no es mayor a 80, pero sí mayor a 50: entra en el else if.',
          commonErrors: [{ pattern: 'Guerrero', message: '¿70 es mayor que 80?' }],
          hints: ['Las condiciones se evalúan de arriba hacia abajo.'],
        },
        {
          type: 'fill_code',
          statement:
            'Escribí la condición del if para que entre cuando `edad` sea mayor o igual a 18.',
          payload: {
            mode: 'blanks',
            template: 'if ({{0}})\n{\n    Console.WriteLine("Adulto");\n}',
          },
          solution: { blanks: [['edad >= 18', '18 <= edad']] },
          explanation: '>= significa "mayor o igual".',
          commonErrors: [
            { pattern: '=>', message: 'El operador es >= (primero el mayor y después el igual).' },
            {
              pattern: '^edad > 18$',
              message: 'Con > el 18 queda afuera. Necesitás "mayor o igual".',
            },
          ],
          hints: ['Comparás edad con 18.', 'Mayor o igual se escribe >='],
        },
        {
          type: 'find_bug',
          statement: 'Este if no hace lo que debería. ¿Dónde está el error?',
          payload: {
            lines: [
              'int vidas = 0;',
              'if (vidas = 0)',
              '{',
              '    Console.WriteLine("Perdiste");',
              '}',
            ],
            fixOptions: [
              { id: 'double-equals', text: 'Usar == para comparar: if (vidas == 0)' },
              { id: 'remove-braces', text: 'Sacar las llaves' },
              { id: 'change-zero', text: 'Inicializar vidas en 3' },
            ],
          },
          solution: { bugLine: 1, fixOptionId: 'double-equals' },
          explanation: 'Un solo = asigna. Para comparar se usa ==.',
          commonErrors: [{ pattern: '^0:', message: 'Inicializar en 0 es válido.' }],
          hints: ['Mirá el operador dentro del if.'],
        },
        {
          type: 'order_blocks',
          statement: 'Ordená el switch que muestra el nombre del día 1 como "Lunes".',
          payload: {
            blocks: [
              { id: 'q', code: 'int dia = 1;' },
              { id: 'z', code: 'switch (dia)' },
              { id: 'w', code: '{' },
              { id: 'k', code: '    case 1:' },
              { id: 'm', code: '        Console.WriteLine("Lunes");' },
              { id: 'r', code: '        break;' },
              { id: 'x', code: '}' },
            ],
            expectedOutput: 'Lunes',
          },
          solution: { validOrders: [['q', 'z', 'w', 'k', 'm', 'r', 'x']] },
          explanation:
            'switch evalúa la variable, cada case compara un valor y break corta la ejecución.',
          commonErrors: [
            { pattern: '^z', message: 'La variable tiene que existir antes del switch.' },
          ],
          hints: [
            'Declarás la variable primero.',
            'Después del case va la instrucción y el break.',
          ],
        },
        {
          type: 'multiple_choice',
          statement: '¿Para qué sirve `break` dentro de un `case`?',
          payload: {
            options: [
              { id: 'exit', text: 'Para salir del switch después de ejecutar ese caso' },
              { id: 'error', text: 'Para lanzar un error' },
              { id: 'repeat', text: 'Para repetir el caso' },
            ],
          },
          solution: { correctOptionId: 'exit' },
          explanation: 'break termina el switch; en C# cada case necesita su break.',
          commonErrors: [{ pattern: '^repeat$', message: 'break corta, no repite.' }],
          hints: ['break = romper, cortar.'],
        },
      ],
    },
    {
      title: 'Bucles',
      challenges: [
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: { code: 'for (int i = 1; i <= 3; i++)\n{\n    Console.WriteLine(i * 2);\n}' },
          solution: { output: '2\n4\n6' },
          explanation: 'i toma los valores 1, 2 y 3; en cada vuelta se muestra el doble.',
          commonErrors: [{ pattern: '^1', message: 'Se muestra i * 2, no i.' }],
          hints: ['¿Qué valores toma i?', 'Multiplicá cada uno por 2.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá el for para que repita **5 veces** (i de 0 a 4).',
          payload: { mode: 'blanks', template: 'for (int i = 0; i {{0}} 5; i++)' },
          solution: { blanks: [['<']] },
          explanation: 'Con i < 5 el bucle corre para i = 0, 1, 2, 3, 4: cinco veces.',
          commonErrors: [{ pattern: '<=', message: 'Con <= daría 6 vueltas (de 0 a 5).' }],
          hints: ['Empieza en 0.', 'Tiene que frenar antes de llegar a 5.'],
        },
        {
          type: 'find_bug',
          statement: 'Este while nunca termina. ¿Por qué?',
          payload: {
            lines: [
              'int remos = 0;',
              'while (remos < 3)',
              '{',
              '    Console.WriteLine("Remando");',
              '}',
            ],
            fixOptions: [
              { id: 'increment', text: 'Agregar remos++; dentro del bucle' },
              { id: 'change-condition', text: 'Cambiar < por >' },
              { id: 'remove-while', text: 'Cambiar while por if' },
            ],
          },
          solution: { bugLine: 3, fixOptionId: 'increment' },
          explanation:
            'Si remos nunca cambia, la condición siempre es verdadera. Hay que incrementarlo dentro del bucle.',
          commonErrors: [
            {
              pattern: '^1:',
              message: 'La condición está bien; el problema es que remos nunca cambia.',
            },
          ],
          hints: ['¿Qué variable controla el bucle?', '¿Esa variable cambia alguna vez?'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué bucle es más cómodo para recorrer todos los elementos de una lista?',
          payload: {
            options: [
              { id: 'foreach', text: 'foreach' },
              { id: 'switch', text: 'switch' },
              { id: 'if', text: 'if' },
            ],
          },
          solution: { correctOptionId: 'foreach' },
          explanation: 'foreach recorre cada elemento de una colección sin manejar índices.',
          commonErrors: [{ pattern: '^(switch|if)$', message: 'Eso no es un bucle.' }],
          hints: ['"Para cada" elemento...'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'string[] tripulacion = { "Ragnar", "Floki" };\nforeach (string vikingo in tripulacion)\n{\n    Console.WriteLine(vikingo);\n}',
          },
          solution: { output: 'Ragnar\nFloki' },
          explanation: 'foreach recorre el arreglo en orden y muestra cada nombre.',
          commonErrors: [
            { pattern: '^Floki', message: 'El recorrido va en el orden del arreglo.' },
          ],
          hints: ['Recorre del primero al último.'],
        },
      ],
    },
    {
      title: 'Métodos',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Qué significa `void` en `static void Saludar()`?',
          payload: {
            options: [
              { id: 'no-return', text: 'Que el método no devuelve ningún valor' },
              { id: 'empty', text: 'Que el método está vacío' },
              { id: 'private', text: 'Que el método es privado' },
            ],
          },
          solution: { correctOptionId: 'no-return' },
          explanation: 'void indica que el método hace algo pero no devuelve un resultado.',
          commonErrors: [
            {
              pattern: '^empty$',
              message: 'void no habla del contenido, sino del valor de retorno.',
            },
          ],
          hints: ['Pensá en return.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá el método para que devuelva la suma de a y b.',
          payload: {
            mode: 'blanks',
            template: 'static int Sumar(int a, int b)\n{\n    {{0}} a + b;\n}',
          },
          solution: { blanks: [['return']] },
          explanation: 'return devuelve el resultado a quien llamó al método.',
          commonErrors: [{ pattern: 'Return|RETURN', message: 'return va en minúscula.' }],
          hints: ['¿Qué palabra devuelve un valor?'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'static int Doble(int numero)\n{\n    return numero * 2;\n}\n\nConsole.WriteLine(Doble(21));',
          },
          solution: { output: '42' },
          explanation: 'Doble(21) devuelve 21 * 2 = 42.',
          commonErrors: [{ pattern: '^21', message: 'El método devuelve el doble del número.' }],
          hints: ['¿Qué hace Doble con el número?'],
        },
        {
          type: 'find_bug',
          statement: 'Este método no compila. ¿Dónde está el error?',
          payload: {
            lines: [
              'static int Triple(int numero)',
              '{',
              '    Console.WriteLine(numero * 3);',
              '}',
            ],
            fixOptions: [
              { id: 'add-return', text: 'Cambiar la línea por return numero * 3;' },
              { id: 'remove-static', text: 'Sacar static' },
              { id: 'change-param', text: 'Cambiar int numero por string numero' },
            ],
          },
          solution: { bugLine: 2, fixOptionId: 'add-return' },
          explanation:
            'Un método int tiene que devolver un int con return. Mostrar no es devolver.',
          commonErrors: [{ pattern: '^0:', message: 'La firma del método está bien.' }],
          hints: ['El método dice que devuelve int...', '¿Dónde está el return?'],
        },
        {
          type: 'fill_code',
          statement: 'Escribí la llamada al método `Saludar` pasándole el texto "Lagertha".',
          payload: { mode: 'free', starterCode: '' },
          solution: { accepted: ['Saludar("Lagertha");'] },
          explanation:
            'Para llamar un método se escribe su nombre y los argumentos entre paréntesis.',
          commonErrors: [
            singleQuotesText,
            { pattern: '^saludar', message: 'El nombre del método empieza con S mayúscula.' },
            missingSemicolon,
          ],
          hints: ['Nombre del método + paréntesis.', 'El texto va entre comillas dobles.'],
        },
      ],
    },
  ],
};
