/*jshint -W030 */
/*jshint -W032 */
const { TextEditor } = require('atom')
const path = require('path')
const createDOMPurify = require('dompurify')
const emoji = require('emoji-images')
const fs = require('fs-plus')
let marked = null // Defer until used
let renderer = null
let cheerio = null
let yamlFrontMatter = null

const { scopeForFenceName } = require('./extension-helper')
const { resourcePath } = atom.getLoadSettings()
const packagePath = path.dirname(__dirname)

let isAsciidoctor;
const asciidocExtensions = [".adoc", ".asciidoc", ".ad", ".asc", ".txt"];
// below does not work
//const iC = require('./iansConfig.js'); //const asciidocExtensions = a;
//let asciidocExtensions = iC.asciidocExtensions;


const emojiFolder = path.join(
  path.dirname(require.resolve('emoji-images')),
  'pngs'
)

// Creating `TextEditor` instances is costly, so we'll try to re-use instances
// when a preview changes.
class EditorCache {
  static BY_ID = new Map()

  static findOrCreateById(id) {
    let cache = EditorCache.BY_ID.get(id)
    if (!cache) {
      cache = new EditorCache(id)
      EditorCache.BY_ID.set(id, cache)
    }
    return cache
  }

  constructor(id) {
    this.id = id
    this.editorsByPre = new Map()
    this.possiblyUnusedEditors = new Set()
  }

  destroy() {
    let editors = Array.from(this.editorsByPre.values())
    for (let editor of editors) {
      editor.destroy()
    }
    this.editorsByPre.clear()
    this.possiblyUnusedEditors.clear()
    EditorCache.BY_ID.delete(this.id)
  }

  // Called when we start a render. Every `TextEditor` is assumed to be stale,
  // but any editor that is successfully looked up from the cache during this
  // render is saved from culling.
  beginRender() {
    this.possiblyUnusedEditors.clear()
    for (let editor of this.editorsByPre.values()) {
      this.possiblyUnusedEditors.add(editor)
    }
  }

  // Cache an editor by the PRE element that it's standing in for.
  addEditor(pre, editor) {
    this.editorsByPre.set(pre, editor)
  }

  getEditor(pre) {
    let editor = this.editorsByPre.get(pre)
    if (editor) {
      // Cache hit! This editor will be reused, so we should prevent it from
      // getting culled.
      this.possiblyUnusedEditors.delete(editor)
    }
    return editor
  }

  endRender() {
    // Any editor that didn't get claimed during the render is orphaned and
    // should be disposed of.
    let toBeDeleted = new Set()
    for (let [pre, editor] of this.editorsByPre.entries()) {
      if (!this.possiblyUnusedEditors.has(editor)) continue
      toBeDeleted.add(pre)
    }

    this.possiblyUnusedEditors.clear()

    for (let pre of toBeDeleted) {
      let editor = this.editorsByPre.get(pre)
      let element = editor.getElement()
      if (element.parentNode) {
        element.remove()
      }
      this.editorsByPre.delete(pre)
      editor.destroy()
    }
  }
}  //END EditorCache

exports.EditorCache = EditorCache

function chooseRender(text, filePath) {
  // iansaddition if file.ext === "adoc type "
  //const isAsciidoctor = true; console.log(`isAsciidoctor = ${isAsciidoctor}`)//true;
  //if (isAsciidoctor == true) { return renderAsciidoctor (text, filePath) } ;

  console.log(`filePath = ${filePath}`);

  let filePathExt = path.extname(filePath);
  if ( asciidocExtensions.includes( filePathExt)) {
    console.log(`fn render isAsciidoctor = ${isAsciidoctor}`)
    isAsciidoctor = true;
  } else {
    isAsciidoctor = false;
  }
  console.log('typeof isAsciidoctor =');  let typeofIsAsciidoctor = typeof isAsciidoctor;
  console.log(typeof( isAsciidoctor)); console.log(`typeofIsAsciidoctor = ${typeofIsAsciidoctor}`);
  if (isAsciidoctor == true) { return renderAsciidoctor (text, filePath) }
  // if isAsiidoctor the above processes & returns the adoc file
  // the rest of this function which processes MD file is bypassed
  // if (!isAsciidoctor) {process MD} else {process adoc}
  // so process adoc above as if it were MD then just "return  renderAsciidoctor(...)""
  // in place of "return fragment"
  // NB the following does not seem to save html if "else {return fragment }" is used.

  if ( text.includes(":pandocMdFlavour:" ) ) {
    console.log( "contains :pandocMdFlavour:" );
    console.log( `text = \n ${text}`)
    return renderPandocMdFlavour( text, filePath );  // NB NB return essential here
    // const cp = require("child_process");
    // //return cp.execSync( `/home/ian/Downloads/pandoc-3.5/bin/pandoc --sandbox  --standalone -f commonmark -t html5 --metadata title="commonmark command"   -o - /media/AcerWinData/github_from_home/IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd/TEST_Adoc_MD_Files_Etc/README_SHORT.md` );
    // //return cp.execSync( `/home/ian/Downloads/pandoc-3.5/bin/pandoc --sandbox  --standalone -f commonmark -t html5 --metadata title="commonmark command"   -o XXX.html /media/AcerWinData/github_from_home/IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd/TEST_Adoc_MD_Files_Etc/README_SHORT.md` );
    // //const myHtml = cp.execSync( `/home/ian/Downloads/pandoc-3.5/bin/pandoc --sandbox  --standalone -f commonmark -t html5 --metadata title="commonmark command"   -o - /media/AcerWinData/github_from_home/IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd/TEST_Adoc_MD_Files_Etc/README_SHORT.md` );
    // const myHtml = cp.execSync( `/home/ian/Downloads/pandoc-3.5/bin/pandoc --sandbox   -f commonmark -t html5 --metadata title="commonmark command"   -o - /media/AcerWinData/github_from_home/IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd/TEST_Adoc_MD_Files_Etc/README_SHORT.md` );
    //
    // console.log( `myHtml=\n ${myHtml}`)
    //
    // html = myHtml.toString() // .toString().trim()
    // html =  `<h1>:Ians pandocMdFlavour:commonmark:</h1>` + html
    // /* ianschange removing template seems to make no difference */
    // const template = document.createElement('template') ; //template is HTMLTemplateElement
    // template.innerHTML = html.trim();
    // // If deep= true, node and its whole subtree, including text that may be in child Text nodes, is also copied.
    // const fragment = template.content.cloneNode(true)
    //
    // //if (!isAsciidoctor) {resolveImagePaths(fragment, filePath) };// ianscomment seems to have no effect
    //
    // return fragment

  }


  if (atom.config.get("iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd.useOriginalParser")) {
    // Legacy rendering with `marked`.
    return render(text, filePath)
  } else {
    // Built-in rendering with `markdown-it`.
    let html = atom.ui.markdown.render(text, {
      renderMode: "fragment",
      filePath: filePath,
      breaks: atom.config.get('iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd.breakOnSingleNewline'),
      useDefaultEmoji: true,
      sanitizeAllowUnknownProtocols: atom.config.get('iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd.allowUnsafeProtocols')
    })
    return atom.ui.markdown.convertToDOM(html)
  }
}

exports.toDOMFragment = async function (text, filePath, grammar, editorId) {
  text ??= ""
  let defaultLanguage = getDefaultLanguageForGrammar(grammar)

  // We cache editor instances in this code path because it's the one used by
  // the preview pane, so we expect it to be updated quite frequently.
  let cache = EditorCache.findOrCreateById(editorId)
  cache.beginRender()

  const domFragment = chooseRender(text, filePath)
  annotatePreElements(domFragment, defaultLanguage)

  return [
    domFragment,
    async (element) => {
      await highlightCodeBlocks(element, grammar, cache, makeAtomEditorNonInteractive)
      cache.endRender()
    }
  ]
}

exports.toHTML = async function (text, filePath, grammar) {
  text ??= "";

  // We don't cache editor instances in this code path because it's the one
  // used by the “Copy HTML” command, so this is likely to be a one-off for
  // which caches won't help.

  const domFragment = chooseRender(text, filePath)
  const div = document.createElement('div')
  annotatePreElements(domFragment, getDefaultLanguageForGrammar(grammar))
  div.appendChild(domFragment)
  document.body.appendChild(div)

  await highlightCodeBlocks(div, grammar, null, convertAtomEditorToStandardElement)

  const result = div.innerHTML;
  div.remove();

  return result;
}
var renderAsciidoctor =  function (text, filePath  , backend = 'html5'  ) {

    const Asciidoctor = require('asciidoctor')();
    console.log(`filePath= ${filePath}`);console.log(`text= ${text}`);
    const currentDir = process.cwd();
    console.log('Current directory= ' + currentDir );

    let textToHTML = '';
    //textToHTML = Asciidoctor.convert(text, {'safe': 'server'} );
    //textToHTML = Asciidoctor.convert(text, {'safe': 'server',  'sourcemap': true,
    //'attributes': {'allow-url-read': true, 'source-highlighter': 'highlight.js', 'standalone': true }}    ); // , WORKS

  //  textToHTML = Asciidoctor.convert(text,   { 'safe': 'server',   'attributes': { 'showtitle': true }}); // ,  WORKS
    // textToHTML = Asciidoctor.convert(text, {   'standalone': true, 'safe':'safe',
    // 'attributes': { 'linkcss': false , 'icons': 'font', 'stylesdir': `${currentDir}` }});  // WORKS
    //textToHTML = Asciidoctor.convert(text); // FAILS 'standalone': true Preview Failed, no such file or dir - ENOENT, static/css/asciidoctor.css not found in /home/ian/Downloads/pulsar-1.119.0/resources/app.asar


    textToHTML = Asciidoctor.convert(text, {'safe': 'server', 'sourcemap': true,
    'attributes': { 'linkcss': false, 'icons': 'font'} } );

     console.log(`ianschange <li> textToHTML >/li> = \n <li> ${textToHTML}</li>\n `);
     //return `<li> ${text}</li>\n`;
     html = textToHTML;
     /* ianschange removing template seems to make no difference */
     const template = document.createElement('template')
     template.innerHTML = html.trim()
     // If deep= true, node and its whole subtree, including text that may be in child Text nodes, is also copied.
     const fragment = template.content.cloneNode(true)

     //if (!isAsciidoctor) {resolveImagePaths(fragment, filePath) };// ianscomment seems to have no effect

     return fragment
} //END renderAsciidoctor

var renderPandocMdFlavour =  function (text, filePath) {

    //cf https://stackoverflow.com/questions/30763496/how-to-promisify-nodes-child-process-exec-and-child-process-execfile-functions

    const cp = require("child_process");
    const pandocBin = '/home/ian/Downloads/pandoc-3.5/bin/pandoc'
    const inputFilePath = filePath;  //'/media/AcerWinData/github_from_home/IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd/TEST_Adoc_MD_Files_Etc/README_SHORT.md';
    //const outputPath = './pandoc_README_SHORT.html';
    let outputPath = filePath + '.html'; console.log(`ASFE outputPath = filePath + '.html'= ${outputPath}`)
    const mdFlavours = ['commonmark', 'commonmark_x', 'markdown', 'markdown_mmd', 'markdown_phpextra', 'markdown_strict']; // , 'rst'];
    //mdFlavoursFull=:pandocMdFlavour:commonmark:,:pandocMdFlavour:commonmark_x:,:pandocMdFlavour:markdown:,:pandocMdFlavour:markdown_mmd:,:pandocMdFlavour:markdown_phpextra:,:pandocMdFlavour:markdown_strict:
    const mdFlavoursFull = mdFlavours.map( i => ":pandocMdFlavour:" + i + ":");
    console.log(`efsg mdFlavoursFull=${mdFlavoursFull}`);

  //  let arrayOfLines = text.split(/\r?\n/, 10); console.log("wdgt  arrayOfLines =" + arrayOfLines);
    //arrayOfLines = arrayOfLines.split(/\r?\n/); console.log("wdgt  arrayOfLines =" + arrayOfLines);
    //arrayOfLines = arrayOfLines.slice(0,10); console.log("xvgs arrayOfLines =" + arrayOfLines);   // keep only 1st 10 elements



    // function checkRegexSimple(regex, str) {
    //   // Reset `lastIndex` if this regex is defined globally
    //   // regex.lastIndex = 0;
    //   console.log(`regex=${regex}`)
    //      result = str.match(regex)
    //      if (result) {
    //       console.log(`###########   checkRegexSimple    str=${str}  Found match,result=${result}`);
    //     } else {
    //     console.log(`Found NO match`);
    //     }
    // } //END checkRegex()

    // let mdFlavourFound = "";
    // const regex = /(?<=\:pandocMdFlavour\:).*(?=\:)/;
    // arrayOfLines.forEach( line => {
    //   result = checkRegexSimple( regex, line )
    //   if (result) {console.log(`sfgj match result=${result} line=${line}`)
    //   } else {console.log `sfgj NO MATCH line=${line}`}
    //
    //
    // })



  //  const lineWiMatch = arrayOfLines.indexOf(":pandocMdFlavour:") // indexOf only finds exact match
     //console.log(`xdsu lineWiMatch =(${lineWiMatch})`)
 //function jumpThisSection() {
//   // cf Flannagan 2ed p167
//     // https://stackoverflow.com/questions/52475099/find-index-number-of-array-value-based-on-partial-string-match
//     let lineWiMatch = arrayOfLines.findIndex( x => x.includes(':pandocMdFlavour:' ));
//     console.log(`ared lineWiMatch arrayOfLines.findIndex =   ${lineWiMatch}  ${arrayOfLines[lineWiMatch]} `)
//     let fullMatch = ""
//     console.table(arrayOfLines, lineWiMatch)
// //function jumpThisSection() {
//     //lineWiMatch = 2
//     if ( lineWiMatch === -1) {
//         console.log(`sfyp lineWiMatch arrayOfLines.findIndex = ${lineWiMatch}  ${arrayOfLines[lineWiMatch]}`)
//         return ""
//     } else {
//         console.table(arrayOfLines[lineWiMatch])
//         fullMatch = arrayOfLines[lineWiMatch] //.toString().trim()
//         console.log("slhi fullMatch =" +  fullMatch)
//         lineWiFullMatch = mdFlavoursFull.findIndex( x => x.includes(arrayOfLines[lineWiMatch] ) )
//         console.log( "sgjl lineWiFullMatch =" + lineWiFullMatch + arrayOfLines[lineWiMatch])
//         console.log("Hello")




    if ( text.includes(":pandocMdFlavour:" ) ) {
      console.log( 'sjlp "text.includes(":pandocMdFlavour:"' )
    };
    let flavour = 'commonmark';
    //flavour = fullMatch

    const regex = /(?<=\:pandocMdFlavour\:).*(?=\:)/;   console.log(`regex=${regex}`)



    // for ( let element in arrayOfLines ) {
    //   s = arrayOfLine[element]
    //   let flavour =  checkRegex(regex, s);



  //flavour = ' -f ' + mdFlavours[element];
  //outputPath = `./pandoc_README_SHORT${element}.html`
  let element = "YYYY"
outputPath = `./pandoc_README_SHORT${element}.html`


    // NB NB --standalone must be removed.
    const command = `${pandocBin} --sandbox  -f ${flavour} -t html5 --metadata title="${flavour} command" --verbose  -o - ${inputFilePath}`
    ;
    console.log(`klop command =${command}`)
    textToHTML = cp.execSync( command );

     console.log(`dhkp ianschange <li> textToHTML >/li> = \n <li> ${textToHTML}</li>\n `);
     //return `<li> ${text}</li>\n`;
     html = textToHTML.toString(); // needed or ERR trim not a fn below
     /* ianschange removing template seems to make no difference */
     let now = new Date();
     html =  `<p>:Ians pandocMdFlavour:commonmark:</p>` +
              //`<p>lineWiMatch=${lineWiMatch} </p>` +
              `<p>${Date("YYYY-MM-DDTHH:mm:ss.sssZ")}</p>` + html
     const template = document.createElement('template')
     template.innerHTML = html.trim()
     // If deep= true, node and its whole subtree, including text that may be in child Text nodes, is also copied.
     const fragment = template.content.cloneNode(true)
     console.log(`adoh fragment=${fragment}`)
     return fragment
}//END renderPandocFlavour


// function HideAllThisfromrenderPandocFlavour() {
//     const util = require("util");
//     const execP = util.promisify(cp.exec);
//
//     async function parallelExec( commands ) {
//       try {
//         const { stdout, stderr } = await execP( commands );
//         console.log( 'COMMANDS try = ', commands );
//         console.log( 'stdout try:', stdout );  // these give no output
//         console.log( 'stderr: try', stderr );  // these give no output
//       } catch(e) {
//         console.error('\n\n\n\n', e); console.error( 'ERROR commands = ' , commands, '\n\n\n\n' );
//       }
//       console.log( 'OK' );
//     };
//
//     function run() {
//       const pandocBin = '/home/ian/Downloads/pandoc-3.5/bin/pandoc'
//       const filePath = '/media/AcerWinData/github_from_home/IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd/TEST_Adoc_MD_Files_Etc/README_SHORT.md';
//       let outputPath = './pandoc_README_SHORT.html';
//       //setTimeout(() => {console.log('Ready '); }, 10000);
//       // for ( let element in mdFlavours ) {
//       //
//       //   let flavour = ' -f ' + mdFlavours[element];
//       //   outputPath = `./pandoc_README_SHORT${element}.html`
//       //
//       // //   //const command = `pandoc --sandbox  --standalone -f markdown -t html5 --metadata title="..." -o ${outputPath} ${filePath}`; //metadata <head><title>...</title></head>
//       // //  // const command = `pandoc --sandbox  --standalone ${flavour} -t html5 --metadata title="..."  ${filePath}`; //metadata <head><title>...</title></head>
//       // //   // const command = `pandoc --sandbox  --standalone ${flavour} -t html5 --metadata title="${flavour}"  ${filePath}`; //metadata <head><title>...</title></head>
//       // //   // const command = `pandoc --sandbox  --standalone ${flavour} -t html5 --metadata title="${flavour}"  -o ${outputPath} ${filePath}`; //metadata <head><title>...</title></head>
//       //  //  const command = `pandoc --sandbox  --standalone ${flavour} -t html5 --metadata title="${element}: ${mdFlavours[element]}"  -o ${outputPath} ${filePath}` ;
//        //const command = `${pandocBin} --sandbox  --standalone ${flavour} -t html5 --metadata title="${element}: ${mdFlavours[element]}"  -o ${outputPath} ${filePath}` ;
//       const command = `${pandocBin} --sandbox  --standalone -f ${flavour} -t html5 --metadata title="${flavour} command"   -o ${outputPath} ${filePath}` ;
//       //
//       //   //Logger.debug(`exec command: '${command}'`);
//       //   console.log(`\n\n\nexec command: '${command}'`);
//       //
//       //   const timeout = 10000; const buffer = 1000000000; // maxBuffer
//       //   //const stdout = cp.execSync(command, { timeout: timeout }, { buffer: buffer });
//       //   //setTimeout(() => {console.log('Ready '); }, 10000);
//       parallelExec(  command );
//       // next line gives stdout output
//       parallelExec( `${pandocBin} --sandbox  --standalone -f ${flavour} -t html5 --metadata title="${flavour} parallelExec -o -"   -o - ${filePath}`) ;
//       parallelExec( `${pandocBin} --sandbox  --standalone -f ${flavour} -t html5 --metadata title="${flavour} parallelExec no -o "  ${filePath}`) ;
//       // next line causes error but no stderr or stdout output
//       parallelExec( `${pandocBin} --sandbox  -standalone -f ${flavour} -t html5 --metadata title="${flavour} parallelExec -o - pandoc error   -o - ${filePath}` ) ;
//       //   //Logger.debug(`exec command: '${command}'`);
//       //   console.log(`\n\n\nexec command: '${command}'`);
//       //
//       //   const timeout = 10000; const buffer = 1000000000; // maxBuffer
//       //   //const stdout = cp.execSync(command, { timeout: timeout }, { buffer: buffer });
//       //   //setTimeout(() => {console.log('Ready '); }, 10000);
//       //parallelExec(  command );
//       const textToHTML = fs.readFileSync(fs.realpathSync(outputPath), "utf8");
//       console.log( `textToHTML parallelExec=\n${textToHTML}`);
//       cp.exec(`${pandocBin} --sandbox  --standalone -f ${flavour} -t html5 --metadata title="${flavour} command"   -o ${outputPath} ${filePath}`);
//       console.log( `textToHTML cp.exec=\n${textToHTML}`);
//       const execSync = require('child_process').execSync;
//       const stdout = execSync(`${pandocBin} --sandbox  --standalone -f ${flavour} -t html5 --metadata title="${flavour} command ecexSync"  -o -  ${filePath}`);
//       console.log(`stdout execSync: ${stdout}`)
//       // let newTextToHTML = cp.exec(`${pandocBin} --sandbox  --standalone -f ${flavour} -t html5 --metadata title="${flavour} command"  -o -  ${filePath}`);
//       // console.log( `newTextToHTML cp.exec=\n${newTextToHTML}`);
//       cp.execSync(`/usr/bin/falkon ${outputPath} `);
//       html = textToHTML ; //textToHTML;
//       /* ianschange removing template seems to make no difference */
//       const template = document.createElement('template')
//       template.innerHTML = html.trim()
//       // If deep= true, node and its whole subtree, including text that may be in child Text nodes, is also copied.
//       const fragment = template.content.cloneNode(true)
//       //if (!isAsciidoctor) {resolveImagePaths(fragment, filePath) };// ianscomment seems to have no effect
//       return fragment
//     }; //END run
//     console.log('Prog run STARTS');
//     //let fragment = run();
//     console.log('Prog run ENDS');
//      return run(); // NB NB fragment NEEDS TO BE DEFINED There
//        // or somethinge else returened
//   } //END HideAllThis-fromrenderPandocFlavour()


// Render with the package's own `marked` library.
function render(text, filePath) {
  if (marked == null || yamlFrontMatter == null || cheerio == null) {
    marked = require('marked')
    yamlFrontMatter = require('yaml-front-matter')
    cheerio = require('cheerio')

    renderer = new marked.Renderer()
    renderer.listitem = function (text, isTask) {
      const listAttributes = isTask ? ' class="task-list-item"' : ''

      return `<li ${listAttributes}>${text}</li>\n`
    }
  }

  marked.setOptions({
    breaks: atom.config.get('iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd.breakOnSingleNewline'),
    renderer
  })

  const { __content, ...vars } = yamlFrontMatter.loadFront(text)

  let html = marked.parse(renderYamlTable(vars) + __content)

  // emoji-images is too aggressive, so replace images in monospace tags with
  // the actual emoji text.
  const $ = cheerio.load(emoji(html, emojiFolder, 20))
  $('pre img').each((_index, element) =>
    $(element).replaceWith($(element).attr('title'))
  )
  $('code img').each((_index, element) =>
    $(element).replaceWith($(element).attr('title'))
  )

  html = $.html()

  html = createDOMPurify().sanitize(html, {
    ALLOW_UNKNOWN_PROTOCOLS: atom.config.get(
      'iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd.allowUnsafeProtocols'
    )
  })

  const template = document.createElement('template')
  template.innerHTML = html.trim()
  const fragment = template.content.cloneNode(true)

  resolveImagePaths(fragment, filePath)

  return fragment
} //end render()

function renderYamlTable(variables) {
  const entries = Object.entries(variables)

  if (!entries.length) {
    return ''
  }

  const markdownRows = [
    entries.map(entry => entry[0]),
    entries.map(_ => '--'),
    entries.map((entry) => {
      if (typeof entry[1] === "object" && !Array.isArray(entry[1])) {
        // Remove all newlines, or they ruin formatting of parent table
        return marked.parse(renderYamlTable(entry[1])).replace(/\n/g,"");
      } else {
        return entry[1];
      }
    })
  ]

  return (
    markdownRows.map(row => '| ' + row.join(' | ') + ' |').join('\n') + '\n'
  )
}

function resolveImagePaths(element, filePath) {
  const [rootDirectory] = atom.project.relativizePath(filePath)

  const result = []
  for (const img of element.querySelectorAll('img')) {
    // We use the raw attribute instead of the .src property because the value
    // of the property seems to be transformed in some cases.
    let src

    if ((src = img.getAttribute('src'))) {
      if (src.match(/^(https?|atom):\/\//)) {
        continue
      }
      if (src.startsWith(process.resourcesPath)) {
        continue
      }
      if (src.startsWith(resourcePath)) {
        continue
      }
      if (src.startsWith(packagePath)) {
        continue
      }

      if (src[0] === '/') {
        if (!fs.isFileSync(src)) {
          if (rootDirectory) {
            result.push((img.src = path.join(rootDirectory, src.substring(1))))
          } else {
            result.push(undefined)
          }
        } else {
          result.push(undefined)
        }
      } else {
        result.push((img.src = path.resolve(path.dirname(filePath), src)))
      }
    } else {
      result.push(undefined)
    }
  }

  return result
}

function getDefaultLanguageForGrammar(grammar) {
  return grammar?.scopeName === 'source.litcoffee' ? 'coffee' : 'text'
}

function annotatePreElements(fragment, defaultLanguage) {
  for (let preElement of fragment.querySelectorAll('pre')) {
    const codeBlock = preElement.firstElementChild ?? preElement
    const className = codeBlock.getAttribute('class')
    const fenceName = className?.replace(/^language-/, '') ?? defaultLanguage
    preElement.classList.add('editor-colors', `lang-${fenceName}`)
  }
}

function reassignEditorToLanguage(editor, languageScope) {
  // When we successfully reassign the language on an editor, its
  // `data-grammar` attribute updates on its own.
  let result = atom.grammars.assignLanguageMode(editor, languageScope)
  if (result) return true

  // When we fail to assign the language on an editor — maybe its package is
  // deactivated — it won't reset itself to the default grammar, so we have to
  // do it ourselves.
  result = atom.grammars.assignLanguageMode(editor, `text.plain.null-grammar`)
  if (!result) return false
}

// After render, create an `atom-text-editor` for each `pre` element so that we
// enjoy syntax highlighting.
function highlightCodeBlocks(element, grammar, cache, editorCallback) {
  let defaultLanguage = getDefaultLanguageForGrammar(grammar)

  const promises = []

  for (const preElement of element.querySelectorAll('pre')) {
    const codeBlock = preElement.firstElementChild ?? preElement
    const className = codeBlock.getAttribute('class')
    const fenceName = className?.replace(/^language-/, '') ?? defaultLanguage
    let editorText = codeBlock.textContent.replace(/\r?\n$/, '')

    // If this PRE element was present in the last render, then we should
    // already have a cached text editor available for use.
    let editor = cache?.getEditor(preElement) ?? null
    let editorElement
    if (!editor) {
      editor = new TextEditor({ keyboardInputEnabled: false })
      editorElement = editor.getElement()
      editor.setReadOnly(true)
      cache?.addEditor(preElement, editor)
    } else {
      editorElement = editor.getElement()
    }

    // If the PRE changed its content, we need to change the content of its
    // `TextEditor`.
    if (editor.getText() !== editorText) {
      editor.setReadOnly(false)
      editor.setText(editorText)
      editor.setReadOnly(true)
    }

    // If the PRE changed its language, we need to change the language of its
    // `TextEditor`.
    let scopeDescriptor = editor.getRootScopeDescriptor()[0]
    let languageScope = scopeForFenceName(fenceName)
    if (languageScope !== scopeDescriptor && `.${languageScope}` !== scopeDescriptor) {
      reassignEditorToLanguage(editor, languageScope)
    }

    // If the editor is brand new, we'll have to insert it; otherwise it should
    // already be in the right place.
    if (!editorElement.parentNode) {
      preElement.parentNode.insertBefore(editorElement, preElement)
      editor.setVisible(true)
    }

    promises.push(editorCallback(editorElement, preElement))
  }
  return Promise.all(promises)
}

function makeAtomEditorNonInteractive(editorElement) {
  editorElement.setAttributeNode(document.createAttribute('gutter-hidden'))
  editorElement.removeAttribute('tabindex')

  // Remove line decorations from code blocks.
  for (const cursorLineDecoration of editorElement.getModel()
    .cursorLineDecorations) {
    cursorLineDecoration.destroy()
  }
}

function convertAtomEditorToStandardElement(editorElement, preElement) {
  return new Promise(function (resolve) {
    const editor = editorElement.getModel()
    // In this code path, we're transplanting the highlighted editor HTML into
    // the existing `pre` element, so we should empty its contents first.
    preElement.innerHTML = ''
    const done = () =>
      editor.component.getNextUpdatePromise().then(function () {
        for (const line of editorElement.querySelectorAll(
          '.line:not(.dummy)'
        )) {
          const line2 = document.createElement('div')
          line2.className = 'line'
          line2.innerHTML = line.firstChild.innerHTML
          preElement.appendChild(line2)
        }
        editorElement.remove()
        resolve()
      })
    const languageMode = editor.getBuffer().getLanguageMode()
    if (languageMode.fullyTokenized || languageMode.tree) {
      done()
    } else {
      editor.onDidTokenize(done)
    }
  } )
}
