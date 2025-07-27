# sketch-dev-poc

sketch-dev: Container Agent for development POC

## Sketch 

<img src="results/sketch-in-action.png" width="600" height="400" />

## Sketch Dev - POC Experience Analysis / Trade-offs

PROS
 * 25 USD as credit
 * Uses Claude Sonnet 4.0
 * There is a docker conainer. 
 * You can either use the console or the web interface.
 * Web interface allow you to run commands on the container fyle system.

CONS
 - Slow. Slower then all agents I tested. Claude code is faster than this. Opencode still the fastest.
 - I had to build it, there is not a pre-built image for linux. 
 - Browser tab sometimes closes out of the blue.
 - When I try to push, I had to type my github credentials inside the docker container on the terminal but I could not type.
 - I had to paste the username for github. I was able to "login with github" it sucks they dont have the integration on the UI for credentials.
 - When I paste the user I got this:
 ```
 https://sketch.dev/s/fb6d-7qgd-2wtn-518s ($1.25/10.00)> Username for 'https://github.com': diegopacheco
🦸 diegopacheco
🕴️  I see you've mentioned "diegopacheco" - could you clarify what you'd like me to do with this? Are you:

- Looking to add this as a team member in the coaching application?
- Need me to reference this GitHub username for something?
- Want me to configure git settings?
- Something else entirely?

Let me know how I can help!
```
 - I had to create a token and paste on the web terminal (ugh so bad)
 - 