import terrainSprite from "@/images/terrain.png";
import mapFile from "@/maps/map.json";
import { Cameras, GameObjects, Scene, Tilemaps } from "phaser";
import setupCamera from "./camera";
import setupControls from "./controls";
import loadHexMap from "./load";

export default class HexMap extends Scene {
	cam: Cameras.Scene2D.Camera | null = null;
	labels: GameObjects.Text[] = [];
	layer: Tilemaps.TilemapLayer | null = null;
	radius: number = 4;

	loadHexMap = loadHexMap.bind(this);
	setupCamera = setupCamera.bind(this);
	setupControls = setupControls.bind(this);

	constructor() {
		super("scene-hexmap");
	}

	preload() {
		this.load.setBaseURL(location.toString());
		this.load.image("terrain", terrainSprite);
		this.load.tilemapTiledJSON("map", mapFile);
	}

	create() {
		this.loadHexMap();
		this.setupCamera();
		this.setupControls();
	}
}
