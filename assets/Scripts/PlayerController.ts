import { _decorator, Component, Vec3, EventMouse, input, Input, Animation } from "cc";
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass("PlayerController")
export class PlayerController extends Component {

    @property(Animation)
    BodyAnim: Animation = null;

    private startJump: boolean = false;
    private jumpStep: number = 0;
    private currentJumpTime: number = 0;
    private jumpTime: number = 0.3;
    private currentJumpSpeed: number = 0;
    private currentPosition: Vec3 = new Vec3();
    private deltaPosition: Vec3 = new Vec3(0, 0, 0);
    private targetPosition: Vec3 = new Vec3();

    private currentMoveIndex: number = 0;

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    reset() {
        this.currentMoveIndex = 0;
        this.node.getPosition(this.currentPosition);
        this.targetPosition.set(0, 0, 0);
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this.startJump)
            return;

        this.startJump = true;
        this.jumpStep = step;
        this.currentJumpTime = 0;

        const clipName = step == 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getState(clipName);
        this.jumpTime = state.duration;

        this.currentJumpSpeed = this.jumpStep * BLOCK_SIZE / this.jumpTime;
        this.node.getPosition(this.currentPosition);
        Vec3.add(this.targetPosition, this.currentPosition, new Vec3(this.jumpStep * BLOCK_SIZE, 0, 0));

        if (this.BodyAnim) {
            this.BodyAnim.play(clipName);
        }

        this.currentMoveIndex += step;
    }

    update(deltaTime: number) {
        if (!this.startJump)
            return;

        this.currentJumpTime += deltaTime;

        if (this.currentJumpTime > this.jumpTime) {
            this.node.setPosition(this.targetPosition);
            this.startJump = false;
            this.onOnceJumpEnd();
        } else {
            this.node.getPosition(this.currentPosition);
            this.deltaPosition.x = this.currentJumpSpeed * deltaTime;
            Vec3.add(this.currentPosition, this.currentPosition, this.deltaPosition);
            this.node.setPosition(this.currentPosition);
        }
    }

    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this.currentMoveIndex);
    }
}
