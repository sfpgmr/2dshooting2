"use strict";

import sfg from './global.js'; 
import * as gameobj from './gameobj.js';
import * as graphics from './graphics.js';

var myBullets = [];

/// 自機弾 
export class MyBullet extends gameobj.GameObj {
  constructor(scene,se) {
  super(0, 0, 0);

  this.speed = 0.5;
  this.power = 1;


  this.mesh = sfg.game.meshes.bullet.clone();
  let bbox = new THREE.Box3().setFromObject(this.mesh);
  let d = bbox.getSize();

  // this.bb = new THREE.BoundingBoxHelper( this.mesh, 0xffff00 );
	// sfg.game.scene.add( this.bb );

  
  this.width = d.x;
  this.height = d.y;

  this.collisionArea.width = d.x;
  this.collisionArea.height = d.y;


  // 移動範囲を求める
  this.top = (sfg.V_TOP - this.height ) ;
  this.bottom = (sfg.V_BOTTOM + this.height );
  this.left = (sfg.V_LEFT + this.width ) ;
  this.right = (sfg.V_RIGHT - this.width );


  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;

  // this.textureWidth = sfg.textureFiles.myship.image.width;
  // this.textureHeight = sfg.textureFiles.myship.image.height;

  // // メッシュの作成・表示 ///

  // var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  // var geometry = graphics.createSpriteGeometry(16);
  // graphics.createSpriteUV(geometry, sfg.textureFiles.myship, 16, 16, 1);
  // this.mesh = new THREE.Mesh(geometry, material);

  // this.mesh.position.x = this.x_;
  // this.mesh.position.y = this.y_;
  // this.mesh.position.z = this.z_;
  this.se = se;
  //se(0);
  //sequencer.playTracks(soundEffects.soundEffects[0]);
  scene.add(this.mesh);
  this.mesh.visible = this.enable_ = false;
  //  sfg.tasks.pushTask(function (taskIndex) { self.move(taskIndex); });
 }

  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  *move(taskIndex) {
    
    while (taskIndex >= 0 
      && this.enable_
      && this.y <= this.top 
      && this.y >= this.bottom 
      && this.x <= this.right 
      && this.x >= this.left)
    {
      
      this.y += this.dy;
      this.x += this.dx;
      
      taskIndex = yield;
    }

    taskIndex = yield;
    sfg.tasks.removeTask(taskIndex);
    this.enable_ = this.mesh.visible = false;
}

  start(x, y, z, aimRadian,power) {
    if (this.enable_) {
      return false;
    }
    this.x = x;
    this.y = y;
    this.z = z - 0.1;
    this.power = power | 1;
    this.dx = Math.cos(aimRadian) * this.speed;
    this.dy = Math.sin(aimRadian) * this.speed;
    this.enable_ = this.mesh.visible = true;
    this.se(0);
    //sequencer.playTracks(soundEffects.soundEffects[0]);
    this.task = sfg.tasks.pushTask(this.move.bind(this));
    return true;
  }
}

/// 自機オブジェクト
export class MyShip extends gameobj.GameObj { 
  constructor(x, y, z,scene,se) {
  super(x, y, z);// extend

  this.collisionArea.width = 6;
  this.collisionArea.height = 8;
  this.se = se;
  this.scene = scene;
  //this.textureWidth = sfg.textureFiles.myship.image.width;
  //this.textureHeight = sfg.textureFiles.myship.image.height;

  // メッシュの作成・表示
  // マテリアルの作成
  //var material = graphics.createSpriteMaterial(sfg.textureFiles.myship);
  // ジオメトリの作成
  //var geometry = graphics.createSpriteGeometry(this.width);
  //graphics.createSpriteUV(geometry, sfg.textureFiles.myship, this.width, this.height, 0);

  //this.mesh = new THREE.Mesh(geometry, material);
  this.mesh = sfg.game.meshes.myship;
  let bbox = new THREE.Box3().setFromObject(this.mesh);
  let d = bbox.getSize();

  this.bb = new THREE.BoundingBoxHelper( this.mesh, 0xffffff );
	sfg.game.scene.add( this.bb );

  
  this.width = d.x;
  this.height = d.y;

  // 移動範囲を求める
  this.top = (sfg.V_TOP - this.height / 2) ;
  this.bottom = (sfg.V_BOTTOM + this.height / 2);
  this.left = (sfg.V_LEFT + this.width / 2) ;
  this.right = (sfg.V_RIGHT - this.width / 2);


  this.mesh.position.x = this.x_;
  this.mesh.position.y = this.y_;
  this.mesh.position.z = this.z_;
  this.rest = 3;
  this.myBullets = ( ()=> {
    var arr = [];
    for (var i = 0; i < 2; ++i) {
      arr.push(new MyBullet(this.scene,this.se));
    }
    return arr;
  })();

  scene.add(this.mesh);
  
  this.bulletPower = 1;

}
  get x() { return this.x_; }
  set x(v) { this.x_ = this.mesh.position.x = v; }
  get y() { return this.y_; }
  set y(v) { this.y_ = this.mesh.position.y = v; }
  get z() { return this.z_; }
  set z(v) { this.z_ = this.mesh.position.z = v; }
  
  shoot(aimRadian) {
    for (var i = 0, end = this.myBullets.length; i < end; ++i) {
      if (this.myBullets[i].start(this.x, this.y , this.z,aimRadian,this.bulletPower)) {
        break;
      }
    }
  }
  
  action(basicInput) {
    if (basicInput.left) {
      if (this.x > this.left) {
        this.x -= 0.15;
      }
    }

    if (basicInput.right) {
      if (this.x < this.right) {
        this.x += 0.15;
      }
    }

    if (basicInput.up) {
      if (this.y < this.top) {
        this.y += 0.15;
      }
    }

    if (basicInput.down) {
      if (this.y > this.bottom) {
        this.y -= 0.15;
      }
    }

    if(basicInput.left && this.mesh.rotation.y > -0.4){
      this.mesh.rotation.y -= 0.02; 
    } else if(basicInput.right && this.mesh.rotation.y < 0.4){
      this.mesh.rotation.y += 0.02;
    } else if(this.mesh.rotation.y != 0 && !(basicInput.left || basicInput.right) ){
      if(this.mesh.rotation.y < 0){
        this.mesh.rotation.y += 0.05;
        if(this.mesh.rotation.y > 0){
          this.mesh.rotation.y = 0;
        }
      }
      if(this.mesh.rotation.y > 0){
        this.mesh.rotation.y -= 0.05;
        if(this.mesh.rotation.y < 0){
          this.mesh.rotation.y = 0;
        }
      }
    }



    if (basicInput.z) {
      basicInput.keyCheck.z = false;
      this.shoot(0.5 * Math.PI);
    }

    if (basicInput.x) {
      basicInput.keyCheck.x = false;
      this.shoot(1.5 * Math.PI);
    }

    this.bb.position.x = this.mesh.position.x;
    this.bb.position.y = this.mesh.position.y;
    this.bb.position.z = this.mesh.position.z;
    this.bb.rotation.y = this.mesh.rotation.y;
}

  
  hit() {
    this.mesh.visible = false;
    sfg.bombs.start(this.x, this.y, 0.2);
    this.se(4);
  }
  
  reset(){
    this.myBullets.forEach((d)=>{
      if(d.enable_){
        while(!sfg.tasks.array[d.task.index].genInst.next(-(1 + d.task.index)).done);
      }
    });
  }
  
  init(){
      this.x = 0;
//      this.y = -100;
      this.y = 0;
      this.z = 0;
      this.rest = 3;
      this.mesh.visible = true;
  }

}

