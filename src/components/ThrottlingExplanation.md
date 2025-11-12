
## Throttling vs. Debouncing

**Throttling** and **debouncing** are two techniques used to control how often a function is executed. They are especially useful for handling events that can fire rapidly, such as `pointermove`, `scroll`, or `resize`.

### Throttling

**Throttling** limits the execution of a function to a certain rate. For example, you can throttle a function to be executed at most once every 100 milliseconds. This is useful for continuous events like `pointermove`, where you want to update the UI in response to the event, but you don't need to do it on every single event.

**Use case:** Tracking the mouse position to update a tooltip or a chart. You don't need to update the UI on every single pixel the mouse moves, but you want to provide a smooth and responsive experience.

### Debouncing

**Debouncing** delays the execution of a function until a certain amount of time has passed without the event being fired. For example, you can debounce a function to be executed only after the user has stopped typing for 500 milliseconds. This is useful for events where you only care about the final state, such as a search input.

**Use case:** Fetching search results as the user types. You don't want to send a request to the server on every keystroke, but you want to fetch the results once the user has stopped typing.

### Why Throttling is Correct for `pointermove`

For a continuous event like `pointermove`, throttling is the correct solution because you want to update the UI at a regular interval as the event is firing. Debouncing would not be appropriate because it would wait until the user stops moving the mouse to update the UI, which would not provide a real-time experience.
