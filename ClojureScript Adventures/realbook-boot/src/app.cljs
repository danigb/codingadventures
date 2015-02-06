(ns app)

(let [c (.. js/document (createElement "div"))]
  (aset c "innerHTML" "<p>i'm dynamically created</p>")
  (.. js/document (getElementById "song") (appendChild c)))
