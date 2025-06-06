import * as THREE from 'three'
import { useDraggableObjects, usePhysics, useScene } from '../init';
import { useModels } from './loadModels';
export const createBoundingMesh = ({group, name, show=false, wireframe=true, draggable=false, type="box", attributes, meshType}:
    {
        name: string,
        group: THREE.Group,
        show?: boolean,
        wireframe?: boolean,
        draggable?: boolean,
        attributes: {
            position: {x: number, y: number, z: number},
            scale?: {x: number, y: number, z: number},
            rotation?: {x: number, y: number, z: number},
            _id: string ,
            color?:string
        }
        type?: "box" | "sphere",
        meshType?: "threemesh" | "gltf"
        // scale: number
    }): THREE.Mesh => {

    const scene = useScene();
    const draggableObjects = useDraggableObjects();
    // Get the bounding box of the loaded model group
    const boundingBox = new THREE.Box3().setFromObject(group);
    // console.log(boundingBox)
    // Calculate the dimensions of the bounding box
    const dimensions = new THREE.Vector3();
    boundingBox.getSize(dimensions);

    let mesh:any;

    if(type==="sphere"){
        const sphereGeometry = new THREE.SphereGeometry(dimensions.x/2);
        // Create a material for the box (you can replace this with your desired material)
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: wireframe });
        // Create a mesh using the box geometry and material
        mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    }
    else{
        // Create a box geometry with the calculated dimensions
        const boxGeometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
        // Create a material for the box (you can replace this with your desired material)
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: wireframe });
        // Create a mesh using the box geometry and material
        mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    }

    mesh.position.set(attributes.position.x, attributes.position.y, attributes.position.z)
    if(attributes.scale)
    mesh.scale.set(attributes.scale.x, attributes.scale.y, attributes.scale.z)

    if(attributes.rotation)
    mesh.rotation.set(attributes.rotation.x, attributes.rotation.y, attributes.rotation.z)

    mesh.model = group
    show ? mesh.visible = true: mesh.visible = false
    mesh.isDraggable = false
    mesh.name = name
    mesh._id = attributes._id
    scene.add(mesh)
    if(draggable) draggableObjects.push(mesh)

    mesh.type = meshType
    mesh.color = attributes.color
    return mesh

    // Position the box at the center of the loaded model
    // boxMesh.position.copy(boundingBox.getCenter());
}

export const addModelToSceneWithBoundingMesh = (modelName:string, attributes:any) => {
    const models = useModels();
    const scene = useScene();

    models[modelName].instances = [...models[modelName].instances, attributes]
    
    const model = models[modelName].data.scene.clone();
    createBoundingMesh({
      name: modelName, 
      group: model, 
      show: false, 
      draggable: true, 
      attributes,
      meshType: models[modelName].type
    })
    // displayModelWithBoundingMesh(modelName, models, scene)
    
    model.rotation.set(attributes.rotation.x, attributes.rotation.y, attributes.rotation.z)
    model.scale.set(attributes.scale.x, attributes.scale.y, attributes.scale.z)
    model.position.set(attributes.position.x, attributes.position.y, attributes.position.z)
    scene.add(model)
}


export const displayModelWithBoundingMesh = (modelName:string, models: any, scene:THREE.Scene) => {

    const physicsWorld = usePhysics();

    for(let i = 0; i < models[modelName].instances.length; i++) {
        const modelmesh = models[modelName].data.scene.clone();
        const attributes = models[modelName].instances[i]
        const scale = attributes.scale ? attributes.scale : {x: 1, y: 1, z: 1}
        const mesh:any = createBoundingMesh({name: models[modelName].name, group: modelmesh, show: false, draggable: true, attributes})
        if(attributes.rotation) {
            modelmesh.rotation.set(attributes.rotation.x, attributes.rotation.y, attributes.rotation.z)
        }
        if(attributes.scale){
            modelmesh.scale.set(scale.x, scale.y, scale.z)
        }
        modelmesh.position.set(attributes.position.x, attributes.position.y, attributes.position.z)

        if(models[modelName].type === "threemesh"){
            if(models[modelName].isTextured !== true)
            modelmesh.material = new THREE.MeshToonMaterial({color: new THREE.Color(models[modelName].instances[i].color).convertSRGBToLinear(), side: THREE.DoubleSide})
        }
        mesh.type = models[modelName].type
        
        scene.add(modelmesh)
        // mesh.scale.y = 5
        // physicsWorldd.add.existing(mesh)
        // mesh.body.setCollisionFlags(2)
        // (mesh as any).body.setCollisionFlags(2)
    }
}


export const displayModelWithoutBoundingMesh = (modelName:string, models: any, scene:THREE.Scene) => {

    for(let i = 0; i < models[modelName].instances.length; i++) {
        const modelmesh = models[modelName].data.scene.clone();
        const attributes = models[modelName].instances[i]
        const scale = attributes.scale ? attributes.scale : {x: 1, y: 1, z: 1}
        // const mesh:any = createBoundingMesh({name: models[modelName].name, group: modelmesh, show: false, draggable: true, attributes})
        if(attributes.rotation) {
            modelmesh.rotation.set(attributes.rotation.x, attributes.rotation.y, attributes.rotation.z)
        }
        if(attributes.scale){
            modelmesh.scale.set(scale.x, scale.y, scale.z)
        }
        modelmesh.position.set(attributes.position.x, attributes.position.y, attributes.position.z)

        if(models[modelName].type === "threemesh"){
            // let color = new THREE.Color(models[modelName].instances[i].color).convertSRGBToLinear()
            if(models[modelName].isTextured !== true){
                modelmesh.material = new THREE.MeshToonMaterial({color: new THREE.Color(models[modelName].instances[i].color).convertSRGBToLinear(), side: THREE.DoubleSide})
            }
            
            
        }
        // mesh.type = models[modelName].type
        
        scene.add(modelmesh)
        // mesh.scale.y = 5
        // physicsWorld.add.existing(mesh)
        // mesh.body.setCollisionFlags(2)
        // (mesh as any).body.setCollisionFlags(2)
    }
}