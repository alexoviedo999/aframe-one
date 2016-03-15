AFRAME.aframeCore.registerComponent('gifsSrc', {
      //dependencies: ['material'],
      schema: {
        canvas: { default: '' },
        src: { default: '' }
      },
      init: function(){
        this.startTime = 0;
        this.nextFrameTime = 0;
        this.frameIdx = 0;
        this.frameCnt = 0;
        this.delayTimes = null;
        this.infinity = false;
        this.loopCnt = 0;
        this.width = 0;
        this.height = 0;
        this.frames = null;
        this.cnv = null;
        this.rafId = 0;
        this.initFlg = true;
      },
      update: function () {
        if (this.initFlg) {
          this.initFlg = false;
          this.cnv = document.querySelector(this.data.canvas);
          loadGIF(this.data.src, function (times, cnt, frames) {
            this.delayTimes = times;
            cnt ? this.loopCnt = cnt : this.infinity = true;
            this.frames = frames;
            this.frameCnt = times.length;
            this.cnv.width = this.width = frames[0].width;
            this.cnv.height = this.height = frames[0].width;
            //document.body.appendChild(this.cnv);
            var span = document.createElement('span');
            span.style.position = 'absolute';
            span.style.left = span.style.top = 0;
            span.style.margin = '5px';
            span.style.fontSize = '20px';
            span.style.color = 'white';
            span.textContent = 'canvas preview';
            //document.body.appendChild(span);
            this.ctx = this.cnv.getContext('2d');
            this.ctx.drawImage(frames[0], 0, 0);
            this.texture = new THREE.Texture(this.cnv);
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.el.object3D.material = new THREE.MeshBasicMaterial({map:this.texture});
            this.startTime = Date.now();
            this.el.sceneEl.addBehavior(this);
          }.bind(this), function (err) { console.log(err) });
        } else {
          (Date.now() - this.startTime) >= this.nextFrameTime && this.nextFrame.call(this);
        }
      },
      nextFrame: function () {
        this.ctx.drawImage(this.frames[this.frameIdx], 0, 0);
        this.texture.needsUpdate = true;
        while ((Date.now() - this.startTime) >= this.nextFrameTime) {
          this.nextFrameTime += this.delayTimes[this.frameIdx++];
          if ((this.infinity || this.loopCnt) && this.frameCnt <= this.frameIdx) {
            this.frameIdx = 0;
            this.loopCnt && --this.loopCnt && !this.loopCnt && this.rafId && cancelAnimationFrame(this.rafId);
          }
        }
      }
    });
