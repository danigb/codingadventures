(ns realbook-lein.core
    (:require [figwheel.client :as fw]
              [clojure.string :as string]
              [om.core :as om :include-macros true]
              [om.dom :as dom :include-macros true]))

(enable-console-print!)

(println "Edits to this text should hide up in your developer console.")

;; define your app data so that it doesn't get over-written on reload

(defonce app-state (atom {:title "All Of Me"
                          :parts [
                          "Cmaj7|%|E7|%|A7|%|Dm|%|E7|%|Am|%|D7|%|Dm7|G7"
                          "Cmaj7|%|E7|%|A7|%|Dm|%|F|Fm|Cmaj7 Em7|A7|Dm7|G7|C6|%"]}))

(println (:title app-state))

(defn split-part [part]
  (string/split part "|"))

(defn transport-view [song owner]
  (reify
    om/IRender
    (render [this]
      (dom/div #js {:className 'transport'}
        (dom/h2 nil (:title song))))))

(defn measure-view [measure owner]
  (reify
    om/IRender
    (render [this]
      (dom/div #js {:className "measure"} measure))))

(defn part-view [part owner]
  (reify
    om/IRender
    (render [this]
      (apply dom/div #js {:className "part"}
        (om/build-all measure-view (split-part part))))))

(defn song-view [data owner]
  (reify
    om/IRender
    (render [this]
      (dom/div nil
        (om/build transport-view data)
        (apply dom/div #js {:className "sheet"}
          (om/build-all part-view (:parts data)))))))

(om/root song-view app-state
  {:target (. js/document (getElementById "app"))})

(fw/start {
  :on-jsload (fn []
               ;; (stop-and-start-my app)
               )})
