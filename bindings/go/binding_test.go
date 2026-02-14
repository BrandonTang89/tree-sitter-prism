package tree_sitter_prism_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_prism "github.com/tree-sitter/tree-sitter-prism/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_prism.Language())
	if language == nil {
		t.Errorf("Error loading prism grammar")
	}
}
