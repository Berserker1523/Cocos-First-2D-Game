import {
    _decorator,
    Component,
    Prefab,
    CCInteger,
    instantiate,
    Node,
    Label,
    Vec3
} from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public boxPrefab: Prefab | null = null;

    @property({ type: CCInteger })
    public roadLength: number = 50;

    // References to the startMenu node.
    @property({ type: Node })
    public startMenu: Node | null = null;

    //references to player
    @property({ type: PlayerController })
    public playerController: PlayerController | null = null;

    //references to UICanvas/Steps node.
    @property({ type: Label })
    public stepsLabel: Label | null = null;

    private road: BlockType[] = [];

    start() {
        this.setCurrentState(GameState.GS_INIT);
        this.playerController?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    init() {
        //show the start menu
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        //generate the map
        this.generateRoad();

        if (this.playerController) {

            //disable input
            this.playerController.setInputActive(false);

            //reset player data.
            this.playerController.node.setPosition(Vec3.ZERO);
            this.playerController.reset();
        }
    }

    generateRoad() {

        this.node.removeAllChildren();

        this.road = [];
        this.road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this.road[i - 1] === BlockType.BT_NONE) {
                this.road.push(BlockType.BT_STONE);
            } else {
                this.road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this.road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this.road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }

        return block;
    }

    setCurrentState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }

                //reset steps counter to 0
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }

                //enable user input after 0.1 second.
                setTimeout(() => {
                    if (this.playerController) {
                        this.playerController.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
    }

    onStartButtonClicked() {
        this.setCurrentState(GameState.GS_PLAYING);
    }

    onPlayerJumpEnd(moveIndex: number) {
        //update steps label.
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this.road[moveIndex] == BlockType.BT_NONE) {   //steps on empty block, reset to init.
                this.setCurrentState(GameState.GS_INIT);
            }
        } else { //out of map, reset to init.
            this.setCurrentState(GameState.GS_INIT);
        }
    }
}


