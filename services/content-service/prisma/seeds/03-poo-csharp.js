const missingNew = {
  pattern: '=\\s*Vikingo\\s*\\(',
  message: 'Para crear un objeto falta la palabra new: new Vikingo()',
};
const javaExtends = {
  pattern: 'extends',
  message: 'En C# la herencia se escribe con dos puntos: class Guerrero : Vikingo',
};
const missingSemicolon = {
  pattern: '[^;}\\s]\\s*$',
  message: 'Te falta el punto y coma (;) al final de la instrucción.',
};

export const oopZone = {
  order: 3,
  slug: 'poo-csharp',
  name: 'POO en C#',
  description:
    'Clases, objetos, propiedades, constructores, encapsulamiento, herencia y polimorfismo.',
  videoUrl: null,
  theorySummary: `## Clases y objetos

Una **clase** es un molde; un **objeto** es algo construido con ese molde.

\`\`\`csharp
class Vikingo
{
    public string Nombre { get; set; }
    public int Fuerza { get; set; }

    public Vikingo(string nombre, int fuerza)
    {
        this.Nombre = nombre;
        this.Fuerza = fuerza;
    }

    public virtual string Gritar() => "¡Por Odín!";
}

Vikingo ragnar = new Vikingo("Ragnar", 90);
\`\`\`

## Encapsulamiento

\`private\` esconde los datos; las propiedades controlan cómo se leen y se cambian.

## Herencia y polimorfismo

\`\`\`csharp
class Guerrero : Vikingo
{
    public Guerrero(string nombre) : base(nombre, 100) { }
    public override string Gritar() => "¡Al ataque!";
}
\`\`\`

Un \`Guerrero\` **es un** \`Vikingo\`, pero grita a su manera (\`override\`).`,
  levels: [
    {
      title: 'Clases y objetos',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Cuál es la diferencia entre una clase y un objeto?',
          payload: {
            options: [
              { id: 'mold', text: 'La clase es el molde; el objeto es algo creado con ese molde' },
              { id: 'same', text: 'Son lo mismo' },
              { id: 'reverse', text: 'El objeto es el molde; la clase es la copia' },
            ],
          },
          solution: { correctOptionId: 'mold' },
          explanation:
            'Con la clase Vikingo podés crear muchos objetos: Ragnar, Lagertha, Floki...',
          commonErrors: [
            { pattern: '^reverse$', message: 'Es al revés: primero existe el molde (la clase).' },
          ],
          hints: ['Pensá en un molde de galletitas.'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para crear un objeto de la clase `Barco`.',
          payload: { mode: 'blanks', template: 'Barco drakkar = {{0}} Barco();' },
          solution: { blanks: [['new']] },
          explanation: 'new crea un objeto nuevo a partir de la clase.',
          commonErrors: [{ pattern: 'New|NEW', message: 'new va en minúscula.' }],
          hints: ['Es la palabra que "crea" objetos.'],
        },
        {
          type: 'fill_code',
          statement:
            'Escribí la línea que crea un objeto `Vikingo` llamado `floki` usando el constructor sin parámetros.',
          payload: { mode: 'free', starterCode: '' },
          solution: { accepted: ['Vikingo floki = new Vikingo();', 'var floki = new Vikingo();'] },
          explanation: 'Tipo, nombre, = new Clase();',
          commonErrors: [missingNew, missingSemicolon],
          hints: ['Empezá por el tipo: Vikingo.', 'Usá new Vikingo().'],
        },
        {
          type: 'order_blocks',
          statement: 'Ordená la definición de la clase `Aldea`.',
          payload: {
            blocks: [
              { id: 'k', code: 'class Aldea' },
              { id: 'r', code: '{' },
              { id: 'b', code: '    public string Nombre { get; set; }' },
              { id: 'x', code: '}' },
            ],
          },
          solution: { validOrders: [['k', 'r', 'b', 'x']] },
          explanation: 'class + nombre, se abre la llave, van los miembros y se cierra la llave.',
          commonErrors: [{ pattern: '^r', message: 'Primero se declara la clase con su nombre.' }],
          hints: ['La palabra class va primero.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'Vikingo bjorn = new Vikingo();\nbjorn.Nombre = "Björn";\nConsole.WriteLine(bjorn.Nombre);',
          },
          solution: { output: 'Björn' },
          explanation: 'Se crea el objeto, se le asigna el nombre y se muestra esa propiedad.',
          commonErrors: [
            {
              pattern: 'bjorn\\.Nombre',
              message: 'Se muestra el valor de la propiedad, no su nombre.',
            },
          ],
          hints: ['¿Qué valor tiene bjorn.Nombre?'],
        },
      ],
    },
    {
      title: 'Propiedades y métodos',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Completá la propiedad automática `Fuerza` de tipo int.',
          payload: { mode: 'blanks', template: 'public int Fuerza { {{0}}; {{1}}; }' },
          solution: { blanks: [['get'], ['set']] },
          explanation: 'get permite leer y set permite escribir la propiedad.',
          commonErrors: [{ pattern: 'Get|Set', message: 'get y set van en minúscula.' }],
          hints: ['Una palabra para leer, otra para escribir.'],
        },
        {
          type: 'multiple_choice',
          statement: 'En `ragnar.Gritar()`, ¿qué es `Gritar`?',
          payload: {
            options: [
              { id: 'method', text: 'Un método del objeto' },
              { id: 'class', text: 'Una clase' },
              { id: 'variable', text: 'Una variable suelta' },
            ],
          },
          solution: { correctOptionId: 'method' },
          explanation: 'Los paréntesis indican que se llama a un método del objeto ragnar.',
          commonErrors: [
            { pattern: '^class$', message: 'ragnar es el objeto; Gritar es algo que sabe hacer.' },
          ],
          hints: ['Fijate en los paréntesis.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'class Vikingo\n{\n    public int Fuerza { get; set; }\n    public void Entrenar() { Fuerza = Fuerza + 10; }\n}\n\nVikingo floki = new Vikingo();\nfloki.Fuerza = 50;\nfloki.Entrenar();\nConsole.WriteLine(floki.Fuerza);',
          },
          solution: { output: '60' },
          explanation: 'Entrenar suma 10 a la fuerza del objeto: 50 + 10 = 60.',
          commonErrors: [{ pattern: '^50', message: 'El método Entrenar cambia la fuerza.' }],
          hints: ['¿Qué hace Entrenar?'],
        },
        {
          type: 'find_bug',
          statement: '¿Qué línea tiene el error?',
          payload: {
            lines: [
              'Vikingo ivar = new Vikingo();',
              'ivar.Nombre = "Ivar";',
              'Console.WriteLine(Vikingo.Nombre);',
            ],
            fixOptions: [
              { id: 'use-object', text: 'Usar el objeto: ivar.Nombre' },
              { id: 'remove-new', text: 'Sacar new en la línea 1' },
              { id: 'quotes', text: 'Sacar las comillas de "Ivar"' },
            ],
          },
          solution: { bugLine: 2, fixOptionId: 'use-object' },
          explanation:
            'Nombre pertenece a cada objeto; hay que leerlo desde ivar, no desde la clase.',
          commonErrors: [{ pattern: '^0:', message: 'Crear el objeto con new está bien.' }],
          hints: ['¿De quién es el Nombre?'],
        },
        {
          type: 'fill_code',
          statement: 'Escribí la llamada al método `Navegar()` del objeto `drakkar`.',
          payload: { mode: 'free', starterCode: '' },
          solution: { accepted: ['drakkar.Navegar();'] },
          explanation: 'objeto.Metodo(); llama al método de ese objeto.',
          commonErrors: [
            {
              pattern: '^Barco\\.',
              message: 'Llamá al método desde el objeto drakkar, no desde la clase.',
            },
            missingSemicolon,
          ],
          hints: ['objeto + punto + método + ()'],
        },
      ],
    },
    {
      title: 'Constructores',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Cómo se tiene que llamar el constructor de la clase `Barco`?',
          payload: {
            options: [
              { id: 'class-name', text: 'Barco' },
              { id: 'constructor', text: 'constructor' },
              { id: 'init', text: 'Init' },
            ],
          },
          solution: { correctOptionId: 'class-name' },
          explanation: 'En C# el constructor se llama igual que la clase.',
          commonErrors: [
            {
              pattern: '^constructor$',
              message: 'Esa palabra es de otros lenguajes. En C# se usa el nombre de la clase.',
            },
          ],
          hints: ['Se llama igual que...'],
        },
        {
          type: 'fill_code',
          statement: 'Completá el constructor para guardar el parámetro en la propiedad.',
          payload: {
            mode: 'blanks',
            template: 'public Vikingo(string nombre)\n{\n    {{0}}.Nombre = nombre;\n}',
          },
          solution: { blanks: [['this']] },
          explanation: 'this se refiere al objeto que se está construyendo.',
          commonErrors: [{ pattern: '^self$', message: 'self es de Python. En C# se usa this.' }],
          hints: ['Es la palabra que significa "este objeto".'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'class Barco\n{\n    public string Nombre { get; set; }\n    public Barco(string nombre) { Nombre = nombre; }\n}\n\nBarco barco = new Barco("Serpiente");\nConsole.WriteLine(barco.Nombre);',
          },
          solution: { output: 'Serpiente' },
          explanation: 'El constructor recibe "Serpiente" y lo guarda en Nombre.',
          commonErrors: [
            {
              pattern: 'nombre',
              message: 'Se muestra el valor guardado, no el nombre del parámetro.',
            },
          ],
          hints: ['¿Qué valor se pasó al constructor?'],
        },
        {
          type: 'find_bug',
          statement: 'Este constructor no compila. ¿Dónde está el error?',
          payload: {
            lines: [
              'class Aldea',
              '{',
              '    public string Nombre { get; set; }',
              '    public Pueblo(string nombre) { Nombre = nombre; }',
              '}',
            ],
            fixOptions: [
              { id: 'rename', text: 'Llamar al constructor Aldea' },
              { id: 'void', text: 'Agregar void antes del nombre' },
              { id: 'private', text: 'Cambiar public por private' },
            ],
          },
          solution: { bugLine: 3, fixOptionId: 'rename' },
          explanation: 'El constructor tiene que llamarse exactamente igual que la clase.',
          commonErrors: [
            {
              pattern: ':void$',
              message: 'Los constructores no llevan tipo de retorno, ni siquiera void.',
            },
          ],
          hints: ['Compará el nombre de la clase con el del constructor.'],
        },
        {
          type: 'fill_code',
          statement:
            'Creá un objeto `Vikingo` llamado `ragnar` pasando "Ragnar" y 90 al constructor.',
          payload: { mode: 'free', starterCode: '' },
          solution: {
            accepted: [
              'Vikingo ragnar = new Vikingo("Ragnar", 90);',
              'var ragnar = new Vikingo("Ragnar", 90);',
            ],
          },
          explanation: 'Los argumentos se pasan entre paréntesis, en el orden de los parámetros.',
          commonErrors: [missingNew, missingSemicolon],
          hints: ['new Vikingo(...)', 'Primero el nombre, después la fuerza.'],
        },
      ],
    },
    {
      title: 'Encapsulamiento',
      challenges: [
        {
          type: 'multiple_choice',
          statement: '¿Qué significa que un campo sea `private`?',
          payload: {
            options: [
              { id: 'inside', text: 'Solo se puede usar dentro de la propia clase' },
              { id: 'everywhere', text: 'Se puede usar desde cualquier lado' },
              { id: 'constant', text: 'Que no puede cambiar nunca' },
            ],
          },
          solution: { correctOptionId: 'inside' },
          explanation:
            'private esconde el dato: desde afuera solo se accede por métodos o propiedades públicas.',
          commonErrors: [{ pattern: '^everywhere$', message: 'Eso es public.' }],
          hints: ['Privado = solo para la clase.'],
        },
        {
          type: 'find_bug',
          statement: '¿Qué línea no compila?',
          payload: {
            lines: [
              'class Cofre',
              '{',
              '    private int oro = 100;',
              '}',
              'Cofre cofre = new Cofre();',
              'Console.WriteLine(cofre.oro);',
            ],
            fixOptions: [
              { id: 'public-property', text: 'Exponer el oro con una propiedad pública' },
              { id: 'remove-new', text: 'Sacar new' },
              { id: 'int-to-string', text: 'Cambiar int por string' },
            ],
          },
          solution: { bugLine: 5, fixOptionId: 'public-property' },
          explanation: 'oro es private: desde afuera de Cofre no se puede leer directamente.',
          commonErrors: [
            {
              pattern: '^2:',
              message: 'Declarar un campo privado es válido; el problema es dónde se usa.',
            },
          ],
          hints: ['¿Desde dónde se intenta leer oro?'],
        },
        {
          type: 'fill_code',
          statement:
            'Completá el modificador para que `Nombre` se pueda leer desde afuera de la clase.',
          payload: { mode: 'blanks', template: '{{0}} string Nombre { get; private set; }' },
          solution: { blanks: [['public']] },
          explanation:
            'public permite leer la propiedad desde afuera; private set impide cambiarla desde afuera.',
          commonErrors: [
            { pattern: '^private$', message: 'Con private no se podría leer desde afuera.' },
          ],
          hints: ['Lo contrario de private.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'class Escudo\n{\n    private int resistencia = 3;\n    public void Golpear() { if (resistencia > 0) resistencia--; }\n    public int Resistencia => resistencia;\n}\n\nEscudo escudo = new Escudo();\nescudo.Golpear();\nescudo.Golpear();\nConsole.WriteLine(escudo.Resistencia);',
          },
          solution: { output: '1' },
          explanation: 'Cada golpe resta 1: 3 → 2 → 1.',
          commonErrors: [{ pattern: '^3', message: 'Golpear cambia la resistencia.' }],
          hints: ['Contá los golpes.'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Por qué conviene validar dentro del set de una propiedad?',
          payload: {
            options: [
              {
                id: 'protect',
                text: 'Para evitar que el objeto quede con datos inválidos (ej. fuerza negativa)',
              },
              { id: 'faster', text: 'Para que el programa sea más rápido' },
              { id: 'required', text: 'Porque C# lo exige siempre' },
            ],
          },
          solution: { correctOptionId: 'protect' },
          explanation:
            'El encapsulamiento permite controlar los cambios y proteger el estado del objeto.',
          commonErrors: [
            { pattern: '^required$', message: 'No es obligatorio, es una buena práctica.' },
          ],
          hints: ['¿Qué pasaría si alguien pone fuerza = -50?'],
        },
      ],
    },
    {
      title: 'Herencia',
      challenges: [
        {
          type: 'fill_code',
          statement: 'Completá para que `Guerrero` herede de `Vikingo`.',
          payload: { mode: 'blanks', template: 'class Guerrero {{0}} Vikingo' },
          solution: { blanks: [[':']] },
          explanation: 'En C# la herencia se indica con dos puntos.',
          commonErrors: [javaExtends],
          hints: ['Es un signo de puntuación.', 'Son dos puntos.'],
        },
        {
          type: 'multiple_choice',
          statement: 'Si `Guerrero : Vikingo`, ¿cuál frase es correcta?',
          payload: {
            options: [
              { id: 'is-a', text: 'Todo Guerrero es un Vikingo' },
              { id: 'reverse', text: 'Todo Vikingo es un Guerrero' },
              { id: 'unrelated', text: 'No tienen relación' },
            ],
          },
          solution: { correctOptionId: 'is-a' },
          explanation:
            'La herencia expresa una relación "es un": el Guerrero hereda todo lo del Vikingo.',
          commonErrors: [
            { pattern: '^reverse$', message: 'Al revés: no todos los vikingos son guerreros.' },
          ],
          hints: ['¿Quién hereda de quién?'],
        },
        {
          type: 'fill_code',
          statement:
            'Completá para llamar al constructor de la clase base con el nombre y fuerza 100.',
          payload: {
            mode: 'blanks',
            template: 'public Guerrero(string nombre) : {{0}}(nombre, 100) { }',
          },
          solution: { blanks: [['base']] },
          explanation: 'base(...) llama al constructor de la clase padre.',
          commonErrors: [{ pattern: '^super$', message: 'super es de Java. En C# se usa base.' }],
          hints: ['Se refiere a la clase "base".'],
        },
        {
          type: 'find_bug',
          statement: 'Este código está escrito con sintaxis de otro lenguaje. ¿Dónde?',
          payload: {
            lines: [
              'class Barco { }',
              'class Drakkar extends Barco',
              '{',
              '    public int Remos { get; set; }',
              '}',
            ],
            fixOptions: [
              { id: 'colon', text: 'Cambiar extends por :' },
              { id: 'inherits', text: 'Cambiar extends por inherits' },
              { id: 'remove-class', text: 'Sacar la palabra class' },
            ],
          },
          solution: { bugLine: 1, fixOptionId: 'colon' },
          explanation: 'extends es de Java. C# usa : para heredar.',
          commonErrors: [{ pattern: ':inherits$', message: 'inherits es de Visual Basic.' }],
          hints: ['Mirá cómo se declara la herencia.'],
        },
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'class Vikingo { public string Saludo() => "Skål"; }\nclass Guerrero : Vikingo { }\n\nGuerrero ubbe = new Guerrero();\nConsole.WriteLine(ubbe.Saludo());',
          },
          solution: { output: 'Skål' },
          explanation: 'Guerrero hereda el método Saludo de Vikingo.',
          commonErrors: [{ pattern: '[Ee]rror', message: 'No hay error: Guerrero hereda Saludo.' }],
          hints: ['¿Guerrero tiene Saludo? Lo hereda.'],
        },
      ],
    },
    {
      title: 'Polimorfismo e interfaces',
      challenges: [
        {
          type: 'predict_output',
          statement: '¿Qué muestra este programa?',
          payload: {
            code: 'class Vikingo { public virtual string Gritar() => "¡Por Odín!"; }\nclass Guerrero : Vikingo { public override string Gritar() => "¡Al ataque!"; }\n\nVikingo v = new Guerrero();\nConsole.WriteLine(v.Gritar());',
          },
          solution: { output: '¡Al ataque!' },
          explanation:
            'Aunque la variable es Vikingo, el objeto es un Guerrero: se usa su versión sobrescrita.',
          commonErrors: [
            { pattern: 'Odín', message: 'El objeto real es un Guerrero, que sobrescribe Gritar.' },
          ],
          hints: ['¿Qué objeto se creó con new?'],
        },
        {
          type: 'fill_code',
          statement: 'Completá para sobrescribir el método `Gritar` de la clase base.',
          payload: { mode: 'blanks', template: 'public {{0}} string Gritar() => "¡Valhalla!";' },
          solution: { blanks: [['override']] },
          explanation: 'override reemplaza un método marcado como virtual en la clase base.',
          commonErrors: [
            {
              pattern: '^virtual$',
              message: 'virtual va en la clase base; en la hija se usa override.',
            },
          ],
          hints: ['La palabra significa "sobrescribir".'],
        },
        {
          type: 'multiple_choice',
          statement: '¿Qué es una interfaz como `IAtacante`?',
          payload: {
            options: [
              { id: 'contract', text: 'Un contrato: define qué métodos tiene que tener una clase' },
              { id: 'object', text: 'Un objeto ya creado' },
              { id: 'variable', text: 'Un tipo de variable numérica' },
            ],
          },
          solution: { correctOptionId: 'contract' },
          explanation: 'Una interfaz dice QUÉ hay que saber hacer; cada clase decide CÓMO.',
          commonErrors: [
            { pattern: '^object$', message: 'No se pueden crear objetos de una interfaz.' },
          ],
          hints: ['Pensá en un contrato.'],
        },
        {
          type: 'order_blocks',
          statement: 'Ordená el código para que `Arquero` implemente la interfaz `IAtacante`.',
          payload: {
            blocks: [
              { id: 'q', code: 'interface IAtacante { string Atacar(); }' },
              { id: 'z', code: 'class Arquero : IAtacante' },
              { id: 'w', code: '{' },
              { id: 'k', code: '    public string Atacar() => "Lanza una flecha";' },
              { id: 'm', code: '}' },
            ],
          },
          solution: { validOrders: [['q', 'z', 'w', 'k', 'm']] },
          explanation:
            'Se declara la interfaz y la clase la implementa definiendo el método Atacar.',
          commonErrors: [
            { pattern: '^z', message: 'Conviene declarar la interfaz antes de usarla.' },
          ],
          hints: ['La interfaz va primero.'],
        },
        {
          type: 'find_bug',
          statement: 'El Guerrero no grita "¡Al ataque!". ¿Qué falta?',
          payload: {
            lines: [
              'class Vikingo { public virtual string Gritar() => "¡Por Odín!"; }',
              'class Guerrero : Vikingo { public string Gritar() => "¡Al ataque!"; }',
            ],
            fixOptions: [
              { id: 'override', text: 'Agregar override en el método de Guerrero' },
              { id: 'remove-virtual', text: 'Sacar virtual en Vikingo' },
              { id: 'static', text: 'Agregar static' },
            ],
          },
          solution: { bugLine: 1, fixOptionId: 'override' },
          explanation:
            'Sin override, el método de Guerrero oculta al de Vikingo en vez de sobrescribirlo.',
          commonErrors: [{ pattern: '^0:', message: 'virtual en la clase base está bien.' }],
          hints: ['¿Qué palabra marca la sobrescritura?'],
        },
      ],
    },
  ],
};
