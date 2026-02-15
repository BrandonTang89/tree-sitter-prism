# tree-sitter-prism

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/index.html) grammar for the [PRISM](https://www.prismmodelchecker.org/) probabilistic model checker that provides syntax highlighting.

Developed for CSGs, TSGs, MDPs, CTMCs and DTMCs. Focused specifically on CSGs during development so some of the syntax for the other types of models may not be fully supported yet.

Particularly we do not support
- LTL-style path properties
- Co-safe LTL reward properties
- Anything real-time related
- Anything partially-observable related

## Build and Test
Note that tests are only currently written for expressions and not entire CSGs.

```bash
tree-sitter generate
tree-sitter test
```

## Standalone Highlighting
### Setup
First ensure that the grammar is built.

Then ensure this repository is contained within one of the directories of the `parser-directories` field of `~/.config/tree-sitter/config.json`.

### Highlighting
```bash
tree-sitter highlight example.prism
```

## Helix Editor Integration
Add the following to `~/.config/helix/languages.toml`:
```toml
[[language]]
name = "prism"
grammar = "prism"
file-types = ["prism"]
scope = "source.prism"

[[grammar]]
name = "prism"
source = { git = "https://github.com/BrandonTang89/tree-sitter-prism", 
           rev = "LATEST_COMMIT_HASH" }
```

where `LATEST_COMMIT_HASH` is the hash of the latest commit on the main branch of this repository.

and then copy the highlights and indents file into `~/.config/helix/runtime/queries/prism`:
```bash
mkdir -p ~/.config/helix/runtime/queries/prism
cd ~/.config/helix/runtime/queries/prism
curl -O https://raw.githubusercontent.com/BrandonTang89/tree-sitter-prism/refs/heads/master/queries/highlights.scm
curl -O https://raw.githubusercontent.com/BrandonTang89/tree-sitter-prism/refs/heads/master/queries/indents.scm
```

and then fetch and build the grammar:
```bash
hx --grammar fetch
hx --grammar build
```

Now if you open a `.prism` or `.props` file in Helix, it should be highlighted. 
You can test this on one of the examples such as [csg_mac_example.prism](./test/csg_mac_example.prism).