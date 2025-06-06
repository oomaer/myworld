import * as THREE from 'three'
import {
  useAnimatingModels,
  useCamera,
  useCharacter,
  useControls,
  useDebugMode,
  useKeys,
  // useComposer,
  // useControls,
  usePhysics,
  usePhysicsObjects,
  useRenderer,
  useScene,
  useStats,
} from '../init'

// animation params
type Frame = XRFrame | null

export type TickData = {
  timestamp: number
  timeDiff: number
  fps: number
  frame: Frame
}

const localTickData: TickData = {
  timestamp: 0,
  timeDiff: 0,
  fps: 0,
  frame: null,
}

const localFrameOpts = {
  data: localTickData,
}

const frameEvent = new MessageEvent('tick', localFrameOpts)

class TickManager extends EventTarget {
  timestamp: number
  timeDiff: number
  frame: Frame
  lastTimestamp: number
  fps: number

  constructor({ timestamp, timeDiff, frame } = localTickData) {
    super()

    this.timestamp = timestamp
    this.timeDiff = timeDiff
    this.frame = frame
    this.lastTimestamp = 0
    this.fps = 0
  }

  startLoop() {
    // const composer = useComposer()
    const renderer = useRenderer()
    const scene = useScene()
    const camera = useCamera()
    const physics = usePhysics()
    const physicsObjects = usePhysicsObjects()
    const controls = useControls()
    const stats = useStats()
    const debugMode = useDebugMode();
    const character = useCharacter()
    const keysPressed = useKeys();
    const animatingModels = useAnimatingModels();

    if (!renderer) {
      throw new Error('Updating Frame Failed : Uninitialized Renderer')
    }

    const animate = (timestamp: number, frame: Frame) => {

      const now = performance.now()
      this.timestamp = timestamp ?? now
      this.timeDiff = timestamp - this.lastTimestamp

      const timeDiffCapped = Math.min(Math.max(this.timeDiff, 0), 100)

      // physics
      // physics.step()
      // console.log("here")
      physics.update(timeDiffCapped*3)
      physics.updateDebugger();

     
      // for (let i = 0; i < physicsObjects.length; i++) {
      //   const po = physicsObjects[i]
      //   const autoAnimate = po.autoAnimate
      //   const body = po.rigidBody
      //   if (autoAnimate) {
      //     const mesh = po.mesh
      
      //     mesh.position.copy({x: body.position.x, y: body.position.y, z: body.position.z} as THREE.Vector3)
      //     mesh.quaternion.copy({x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w} as THREE.Quaternion)
      //   }

      //   if(debugMode) {
      //     const mesh = po.debugMesh as THREE.Mesh
      //     mesh.position.copy({x: body.position.x, y: body.position.y, z: body.position.z} as THREE.Vector3)
      //     mesh.quaternion.copy({x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w} as THREE.Quaternion)
      //   }

      //   const fn = po.fn
      //   fn && fn()
      // }

      if(character.characterControls){
        character.characterControls.update(0.01, keysPressed)
        // character.characterControls.updateCameraTarget();
      }

      animatingModels.forEach((model:any) => {
        if(model.type === "spring"){
          model.mesh.position.set(model.mesh.position.x, model.mesh.position.y + 0.01, model.mesh.position.z);
          // console.log(model.mesh.position.y)
        }
      })

      // performance tracker start
      this.fps = 1000 / this.timeDiff
      this.lastTimestamp = this.timestamp

      // controls.update(timestamp / 1000, timeDiffCapped / 1000)

      // composer.render()
      renderer.render(scene, camera);

      this.tick(timestamp, timeDiffCapped, this.fps, frame)

      stats.update()

      // performance tracker end
    }

    renderer.setAnimationLoop(animate)
  }

  tick(timestamp: number, timeDiff: number, fps: number, frame: Frame) {
    localTickData.timestamp = timestamp
    localTickData.frame = frame
    localTickData.timeDiff = timeDiff
    localTickData.fps = fps
    this.dispatchEvent(frameEvent)
  }
}

export default TickManager
