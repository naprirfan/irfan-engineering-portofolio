# Fun Projects & Experiments

A collection of small projects and experiments I've built over the years, mostly driven by curiosity and the enjoyment of making things work in the browser.

These projects are not intended to be production applications. They're examples of hands-on experimentation with JavaScript, React, frontend interactions, and programming concepts.

## Projects

### 1. Simon Game

**[Play on CodePen](https://codepen.io/naprirfan/pen/BKKEEN)**

A browser-based implementation of the classic Simon memory game.

The game generates a sequence of colored buttons accompanied by sounds. The player must remember and reproduce the sequence. Each successful round adds another step, gradually increasing the difficulty.

**Features**
- Randomly generated color sequences.
- Audio feedback for each color.
- Visual feedback when a button is activated.
- Increasing difficulty as the sequence grows.
- Strict Mode, where an incorrect answer resets the game.
- Regular mode, where the player can retry the current sequence.

**Technologies**
- JavaScript
- jQuery
- Sass / CSS preprocessing
- HTML

**What I explored**

Implementing an interactive game involves more than handling button clicks. This project was a small exercise in managing game state, sequencing asynchronous actions, coordinating audio and visual feedback, and handling different game modes.

---

### 2. Conway's Game of Life — React

**[Play on CodePen](https://codepen.io/naprirfan/pen/EKZdvm)**

An interactive implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), a cellular automaton based on a small set of rules.

The simulation runs on a two-dimensional grid. Each cell can be alive or dead, and its next state depends on the states of its eight neighbors.

**Features**
- Interactive grid where cells can be toggled manually.
- Automatic generation of subsequent states.
- Play, pause, and reset controls.
- Generation counter.
- Random initial population.
- Wraparound grid boundaries, where cells at one edge are neighbors of cells at the opposite edge.

**Technologies**
- React
- JavaScript
- PubSub.js
- HTML
- Sass / CSS preprocessing

**What I explored**

This project was an exercise in modeling a simulation using React components and state.

Some interesting aspects included:
- Representing the grid as a data structure.
- Calculating each cell's next state based on its neighbors.
- Keeping simulation updates separate from rendering.
- Managing recurring updates and cleaning up intervals.
- Using a publish-subscribe mechanism to communicate between UI controls and the simulation.

---

## Why I keep these projects

I enjoy building things outside the requirements of commercial projects. Small experiments like these provide an opportunity to explore programming concepts, try different approaches, and learn by implementing something from scratch.

They're also a reminder that software engineering is not only about delivering business features. Sometimes it's simply about curiosity, problem-solving, and having fun with code.