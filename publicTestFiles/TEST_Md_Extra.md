



choosePandocMdFlavour:markdown: (Pandoc version)
choosePandocMdFlavour:markdown_strict: (Pandoc version lss extensions for Gruber's original, Markdown.pl)  
choosePandocMdFlavour:markdown_phpextra: (PHP Markdown Extra)
choosePandocMdFlavour:markdown_mmd: (MultiMarkdown)
choosePandocMdFlavour:gfm:
choosePandocMdFlavour:C: (CommonMark)     
:choosePandocMdFlavour:commonmark_x:  (CommonMark with many pandoc extensions)  
pandocMdFlavour:gfm: (Github-Flavored Markdown)
choosePandocMdFlavour:markdown_github: (deprecated GitHub-Flavored Markdown)


Extramark

The aim of ExtraMark is to create a well-defined flavor of Markdown that is a clear superset of CommonMark as it is becoming more and more accepted as the de-facto standard for basic Markdown syntax. This project includes the most common syntax extensions for Markdown to have a flavor that could be used by a wide variety of projects and applications. In order to achieve this I created this comparison. Below is the reasoning for the syntax choices for Extramark.
Syntax extensions
Superscript

The ability to create superscript text seems to be a common feature among the various flavors. With the execption of Redcarpet, all implementations support the ^...^ syntax. Some support the variant where the closing ^ is missing, but to keep the snytax unambiguous the closing ^ is required.

The cube's surface area is 36 cm^3^.

Subscript

Just as superscript, subscript is a popular syntax extension. All of the above flavors that support it has the same syntax.

Tap water mainly consists of H~2~O but it has many other components as well.

Strikethrough

The stikethrough syntax extension was popularized by GFM and has two syntaxes across implementations. Some variants use the ~~...~~ syntax while dialects use the syntax from CriticMarkup. Some use both. Using CriticMarkup seems the right choice here as it is a somewhat standarized specification for edits in text. Adding support to the GFM style strikethroughs could increase cross compatibility with many dialects.

Markdown is a does ~~not~~ support strikethroughs.

Insertion

All implementations use some form of the + symbol to denote insertion. Using the CriticMarkup syntax here seems reasonable as it provides specification to all text edit options.

Markdown supports bold, italic{++ and insertions++}.

Highlight

As with strikethrough and insertion CriticMarkup also provides solution to this syntax extension. The ==...== syntax is also widely used so adding support for this could increase compatibilty.

Markdown syntax {==is extended==} by many syntax extensions.

Footnotes

There seems to be a concensus on how to denote footnotes in Markdown. The only difference is that while some dialects only allow numbers as the footnote indicator, others allow any text. The latter is the more universal solution.

    This syntax extension is not yet part of ExtraMark!

This page is written with Markdown[^1].

[^1]: Or at least some dialect of it.

Task lists

Any implementation that uses task lists uses the snytax of GFM.

    This syntax extension is not yet part of ExtraMark!

# Todo

- [X] Add CriticMarkup support
- [ ] Add task list support
- [ ] Add Footnotes support

Tables

Tables are one of the most common feature among Markdown dialects and most use the GFM style tables (some with additions). Using the GFM style seems to be the right path.
Abbreviation

Abbreviations are also a popular feature in Markdown dialects. There is a universal concensus on the syntax.

    This syntax extension is not yet part of ExtraMark!

*[MD]: Markdown
MD is a lightweight markup language for creating documents.

Definition lists

Another common syntax extension is the definition list. The syntax is the same for all dialects.

Markdown
: A lightweight markup language for creating documents.

Smart typo

Some Markdown dialects support transforming common symbols into single characters (e.g. (c) or (tm)). While not a feature that many dialects support it is a pain-free quality of life improvement for writing Markdown documents.

A copyright symbol: (c)

Table of contents

Generating a table of contents with a single "Markdown tag" can help you save a lot of time, but the single-tag TOC doesn't show the content that actually gets generated. For that I believe a single-tag TOC is an antipattern in Markdown. There are wonderful tools for text editors that can generate a table of contents for any Markdown document with a press of a button. Generating the TOC as a simple nested Markdown list helps maintaining readability and does not violate the original Markdown philosophy: "A Markdown formatted document should be publishable as-is, as plain text...".
Math

Math for Markdown is a hard question. There are many implementations and most of them use their own syntax. The two most common syntax elements are using the $ and $$ as delimiters for inline and block math and using LaTeX's \\(...\\) and \\[...\\] delimiters. As it is already commonplace to use LaTeX for the actual math markup it seems logical to use LaTeX's delimiters but they are very long and hard to read. And the original Markdown philosophy says: "Readability, however, is emphasized above all else.". That is an argument for using the $ sign delimiter. There are some hard arguments for and against both methods on the CommonMark forum.

    This syntax extension is not yet part of ExtraMark!

Mermaid

Some Markdown dialects allow the creation of diagrams using Mermaid syntax. This seems to contradict the original idea of Markdown documents as these generate some images that should be separate content. For the time being I don't see any good reasons to include Mermaid.

    This syntax extension is not part of ExtraMark!

Conclusion

Based on these results I created the ExtraMark flavor of Markdown. It ended up being very similar to MultiMarkdown but MultiMarkdown is not based on CommonMark and doesn't have a universal JavaScript implementation.

To use ExtraMark check out its repo on Github.
