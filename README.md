# Iansasciidoc Previewfrompackagesmarkdownpreview20240610withmd package

Ian's adaptation of pulsar's excellent package markdown-preview to preview asciidoc files. . This version will preview  flavours of markdown using pancdoc by identifying them with a simple code within the first 10 lines of the file being edited.
<kbd>ctrl-alt-shft-c</kbd> will preview as an asciidoc file with live update, <kbd>ctrl-alt-shft-g</kbd> will open in external browser falkon, <kbd>ctrl-alt-shft-s</kbd> save as pdf. See section What does work for precise details. It is very sensitive to configuration so read below and experiment. What does work When the cursor is in the text editor pane <kbd>ctrl-alt-shft-c</kbd> will try to render it as asciidoctor which may or not make sense. For example, a markdown file will be only partly rendered as expected.

## What is asciidoctor.js and how to install it
Asciidoctor.js is supplied by Asciidortor.org and is a transpiled from the native Ruby source code asciidoctor.rb. For practcal purposes it is identical to the original Ruby code and the details can be found at https://github.com/asciidoctor/asciidoctor.js#quickstart. The syntax is similar to Markdown but can be used to write complex documents with detailed features including configuration, tables, diagnrams, code language highlighting and much more.
To check that it is installed and set up correctly on Linux follow the quickstart in the last link.

The details of syntax can be found in these documents on asciidoctor.org:

* [Asciidoctor Quick Reference](https://docs.asciidoctor.org/asciidoc/latest/syntax-quick-reference/)

* [AsciiDoc Language Documentation - About AsciiDoc](https://docs.asciidoctor.org/asciidoc/latest/)

* [Asciidoctor Documentation - What is Asciidoctor](https://docs.asciidoctor.org/asciidoctor/latest/)

* [Compare AsciiDoc to Markdown - Starting with Markdown Graduating to Asciidoctor](https://docs.asciidoctor.org/asciidoc/latest/asciidoc-vs-markdown/)

* [Differences between Asciidoctor and AsciiDoc](https://mrduguo.github.io/asciidoctor.org/docs/asciidoc-asciidoctor-diffs/)

* [Asciidoctor.css](https://docs.asciidoctor.org/asciidoctor/latest/html-backend/default-stylesheet/) This package includes asciidoctor.css as the default stylesheet which is embedded in the html files generated for previewing adoc files. The stylesheet embedded or linked can be altered in asciidoctor configuration in the front matter, see the documentation.

**Be sure to disable** atom-language-asciidoctor which is an atom package. It does some strange things, for example, if it is enabled may package will no longer open files with extensions: .txt, .adoc and possibly others occassionally like .ron.
Others Atom packages for AsciiDoc should not be enables including: language-asciidoc,: Syntax highlighting and snippets for AsciiDoc & autocomplete-asciidoc. asciidoc-preview: Show a preview for the AsciiDoc has been fixed and should be OK but it is hoped that the current pacakage will replace that and be more resillient to changes in pulsar and its dependencies.
asciidoc-image-helper: When pasting an image into an Asciidoc document, this package will paste clipboard image data as a file into a folder specified by the user.
asciidoc-assistant: install Atom AsciiDoc basic packages with one package.

Add this to config.cson under core. It ensures that adoc & asciidoc files are treated as text not as YAML type files:
core:

```
  customFileTypes:
    "text.plain": [
      "adoc"
      "asciidoc"
    ]
```

<!---
## Configuration From IansasciidocPreviewFrompackagesmarkdownpreview20240610withmd
<!--- ~~**Be sure to disable** atom-language-asciidoctor which is an atom package. It does some strange things, for example, if it is enabled may package will no longer open files with extensions: .txt, .adoc and possibly others occasionally like .ron.~~


```Atom packages for AsciiDoc``` should ```not``` be enabled including: (provisional list). They may stop this package working.

* ```language-asciidoc```,: Syntax highlighting and snippets for AsciiDoc & ```autocomplete-asciidoc```.
* ```asciidoc-preview```: Show a preview for the AsciiDoc has been fixed and should be OK but it is hoped that the current package will replace that and be more resillient to changes in pulsar and its dependencies.
* ```asciidoc-image-helper```: When pasting an image into an Asciidoc document, this package will paste clipboard image data as a file into a folder specified by the user.
* ```asciidoc-assistant```: install Atom AsciiDoc basic packages with one package.

Add this to ```config.cson``` under core. It ensures that adoc & asciidoc files are treated as text not as YAML type files:
```
core:
  customFileTypes:
    "text.plain": [
      "adoc"
      "asciidoc"
    ]
```
--->

## What does work

<kbd>ctrl-alt-shft-c</kbd> will preview adoc type file   
<kbd>ctrl-alt-shft-g</kbd> (cursor in adoc source pane) will render the file in external falkon browser.
<kbd>ctrl-alt-shft-s</kbd> will save files as pdf and preview and render this file in pulsar..
<kbd>ctrl-shft-s</kbd> will save as html and show this source file in pulsar. Using node asciidoctor-web-pdf.js. (Also tried to run asciidoctor-pdf.rb but this fails wi no output.

(If the official pulsar mardown-preview package is enabled then <kbd>ctrl-shift-m</kbd> , will preview markdown files. It  uses github md, I think.)

## Previewing markdown files.
  With cursor in an ordinary md file <kbd>ctrl-alt-shft-c</kbd> will preview as original pulsar markdown-preview github flavour.

   If a single one of the codes exactly listed below is placed on a single line then <kbd>ctrl-alt-shft-c</kbd> will run pandoc for that md flavour.

   ``` ::choosePandocMdFlavour:markdown: (Pandoc version) ```  
   ``` ::choosePandocMdFlavour:markdown_strict:``` (Pandoc version less extensions for Gruber's original, Markdown.pl)
   ``` ::choosePandocMdFlavour:markdown_phpextra: ``` (PHP Markdown Extra)  
   ``` ::choosePandocMdFlavour:markdown_mmd: ``` (MultiMarkdown)   
   ``` ::choosePandocMdFlavour:commonmark: ``` (CommonMark)  
   ``` ::choosePandocMdFlavour:commonmark_x: ```  (CommonMark with many pandoc extensions)
   ``` ::choosePandocMdFlavour:gfm: ``` (Github-Flavored Markdown)
   ``` ::choosePandocMdFlavour:markdown_github: ``` (deprecated GitHub-Flavored Markdown)

#### Previewing Rmarkdown files.
Rmardown is the only markdown that I have experience of using when analysing data with the R programming language. Rmarkdown is Pandoc's version of markdown extended to include the requirements of R and knitr. For detailed information see https://stackoverflow.com/questions/40563479/relationship-between-r-markdown-knitr-pandoc-and-bookdown How well this app will render Rmarkdown I have never tried.


## What does not work
Infront matter :backend:  is unlikely to work cost backends are written in ruby & js versions needed.

Test in spec directory do not function because they are the originals from pulsar markdown-preview. When I know more about how to write these that will change.

## How IansasciidocPreviewFrommarkdownpreviewnomd functions:  Note well - WORK IN PROGRESS
Most of the code comes directly from pulsar markdown-preview. The main change is that when an adoc file is previewed the render function in render.js calls node asciidoctor.convert.js in renderAsciidoctor() instead of the original render(). render() is called with ```const domFragment = render(text, filePath)``` in render.js by exports.toHTML() & exports.toDOMFragment(). If a pandoc string is deteded then pandoc is called to render the file.
asciidoctor.convert is part of the node package asciidoctor.js. The big advantage in using this is that it is maintained by https://asciidoctor.org/ . It is a javascript translation of the Ruby asciidoctor.rb. This relieves pulsar of any maintenance.

#### Functions used:
In ```renderer.js``` ```exports.toDOMFragment()```  ```exports.toHTML()``` calls ```chooseRender()```.

If ```chooseRender()``` detects an asciidoc file extension then ```renderAciidoctor()``` is called to render to HTML.

Otherwise if ```checkMdFlavour()``` finds a recognised string like  ```::choosePandocMdFlavour:markdown_phpextra:``` then ```renderPandocMdFlavour()``` is called.  ```renderPandocMdFlavour()``` 1. creates a command line which writes a file named ```(<inputFilename>_<mdFlavour>.html)``` & 2. creates an HTML string which is returned rendered by pulsar.
Otherwise  ```render()``` function is called. (The original ```render()``` from pulsar markdown-preview.)



The vast majority of the front matter Convert Options work as expected which includes, for example, style-sheet management, sourcemap, and standalone or embedded document. See https://docs.asciidoctor.org/asciidoctorj/latest/asciidoctor-api-options/. However, some of them are a bit tricky to use and the render renderAsciidoctor() function includes these in the call ```textToHTML = Asciidoctor.convert(text,{ 'standalone': true, 'safe':'safe',
'attributes': { 'linkcss': false , 'icons': 'font'}});``` to produce a working html file most of the time with an embedded style-sheet. Using asciidoctor.convert() means that none of these need to be handled by the pulsar package and their conversion coding is provided by the asciidoctor.org.

(At the moment there is a check that the file extension is .adoc but that will be removed soon. This is a remnant from the other similar package (but not developed properly yet) which will preview both md & adoc, IansasciidocPreviewFrommarkdownpreviewnomd Note terminal "nomd" no markdown.)

The new function in main.js ```openBrowserPopup()``` calls the browser falkon which will give an additional view of the links in the file. An alternative browser could be coded in. In the future this could be in the configSchema option.

WARNING: I am pretty new to js & pulsar package coding, so you will probably have to find how to make the package work for you: it certainly works for me on a daily basis maintaining websites with 100s of external & internal links.  But it does show proof of possibility that pulsar markdown-preview can be easily altered to preview asciidoc files. The other similar package IansasciidocPreviewFrommarkdownpreview, without the terminal "nomd" attempts to preview both markdown and asciidoc documents. It works, but it needs more development.

<hr><hr><hr>

<!---
# README.md for original markdown-preview

Show the rendered HTML markdown to the right of the current editor using <kbd>ctrl-shift-m</kbd>.

It is currently enabled for `.markdown`, `.md`, `.mdown`, `.mkd`, `.mkdown`, `.ron`, and `.txt` files.

![iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd](https://cloud.githubusercontent.com/assets/378023/10013086/24cad23e-6149-11e5-90e6-663009210218.png)

## Customize

By default Iansasciidoc Previewfrompackagesmarkdownpreview20240610withmd uses the colors of the active syntax theme. Enable **Use GitHub.com Style** in the __package settings__ to make it look closer to how markdown files get rendered on github.com.

![iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd GitHub style](https://cloud.githubusercontent.com/assets/378023/10013087/24ccc7ec-6149-11e5-97ea-53a842a715ea.png)

When **Use GitHub.com Style** is selected, you can further customize the theme of the Markdown preview with the **GitHub.com Style Mode** setting. Since the GitHub website has a light theme and a dark theme, `iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd` allows you to choose which theme to use when previewing your files. By default, it will use whatever mode is preferred by your system, but you can opt into “Light” or “Dark” to force it to use a particular theme.

No matter which theme you use, you can apply further customizations in your `styles.less` file. For example:

```css
.iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd prec {
  background-color: #444;
}
```

## Language identifiers in fenced code blocks

A detailed Markdown specification helps to ensure that Markdown is displayed consistently across multiple parsers. Sadly, the same isn’t true of code block language identifiers — the strings you use to tell the renderer what sort of code is inside a code block.

The CommonMark specification [explicitly avoids standardizing these identifiers](https://spec.commonmark.org/0.31.2/#info-string):

> The first word of the info string is typically used to specify the language of the code sample, and rendered in the class attribute of the code tag. However, this spec does not mandate any particular treatment of the info string.

There are several valid ways to infer specific languages from language identifiers such as `js`, `less`, `coffee`,  and `c`. This package supports the following systems, configured via the **Syntax Highlighting Language Identifiers** setting:

  * [Linguist](https://github.com/github-linguist/linguist): Used by GitHub (previously the default and only language identification system).
  * [Chroma](https://github.com/alecthomas/chroma): Used by CodeBerg/Gitea/Hugo/Goldmark.
  * [Rouge](https://github.com/rouge-ruby/rouge): Used by GitLab/Jekyll.
  * [HighlightJS](https://highlightjs.org/): Used in a number of places, but most relevantly on the [Pulsar Package Registry](https://web.pulsar-edit.dev/) website.

If none of these systems meets your needs, you may specify custom language identifiers. This may not be as portable as the systems described above, but it will at least produce the desired outcome on your own system.

The setting **Custom Syntax Highlighting Language Identifiers** lets you define a list of custom language identifiers that match up to languages available within your Pulsar installation.

For example, if you wanted to map `j` to JavaScript and `p` to Python, you’d add the following text to the **Custom Syntax Highlighting Language Identifiers** field:

```
j: source.js, p: source.python
```

Now `iansasciidoc-previewfrompackagesmarkdownpreview20240610withmd` will understand what to do with fenced code blocks that begin with <code>\`\`\`j</code> or <code>\`\`\`p</code>. These custom identifiers will work alongside whatever system you’ve chosen with **Syntax Highlighting Language Identifiers**, but will supersede that system in the event of conflict.
--->
