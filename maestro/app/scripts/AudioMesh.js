/**
 * Copyright (C) 2011 by Paul Lewis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var AEROTWIST = AEROTWIST || {};
AEROTWIST.AudioMesh = new function()
{
	// internal vars
	var camera,
		scene,
		renderer,
		flashContainer,
		flashContent,
		mode,
		particles,
		orbitCamera		= true,
		orbitValue 		= 0,
		$container 		= $('#container'),
		width			= $container.width() - 15,
		height			= $container.height() - 15,
		$gui			= $('#gui'),
		vars			= [],
		logCount		= 0,
		flashHidden		= false,
		vertices		= [],
		sinWave			= true,
		sinVal			= 0,
		vMarker			= 0,
		hue				= 0,
		dataDumped		= false,
		
	// core objects
		ico,
		shadow,
		particleSystem,
		centerGlowSystem,
		spotlight,
		
	// constants
		HUE_RATE		= 0.001,
		SIN_RATE		= 1,
		WEBGL_MODE		= 1,
		FLASH_MODE		= 0,
		DEPTH 			= 800,
		NEAR 			= 1,
		FAR 			= 10000,
		AGGRESSION		= 5,
		DAMPEN			= .9;
		fin 			= true;
	
	/**
	 * Initializes the experiment and kicks
	 * everything off. Yay!
	 */
	this.init = function()
	{
		mode 						= FLASH_MODE;
		
		// stop the user clicking
		document.onselectstart		= function(){ return false; };
		
		// set up our initial vars
		vars["mappingMarker"]		= "y";
		vars["particleThreshold"]	= 9;
		vars["sensitivity"]			= 1;
		vars["orbitSpeed"]			= 0.01;
		
		flashContainer 				= document.createElement('div');
		flashContainer.id 			= 'flashcontainer';
		flashContent				= document.createElement('div');
		flashContent.id				= 'flashcontent';
		flashContainer.appendChild(flashContent);
		
		// append the Flash container
		$container.append(flashContainer);
		
		// embed it
		embedFlash();
		    
		// add listeners
		addEventListeners();
		    
		// start rendering, which will
	    // do nothing until the image is dropped
		update();
	};
	
	/**
	 * Callback for the Flash to pass through new
	 * data as it gets it from the microphone
	 */
	this.newData = function(audioData, hideFlash)
	{
		// we have received audio data
		// so hide the flash and start up
		// the WebGL
		if(hideFlash && !flashHidden) {
			flashContainer.className = 'live';
			$("#gui").addClass('live');
			
			createRenderer();
			createObjects();
			
			flashHidden = true;
			mode = WEBGL_MODE;
			
			callbacks.windowResize();
		}
		
		// go through each vertex 
		var vCount = vertices.length;
		while(vCount--)
		{
			// grab the vertex and based on the
			// audio data work out how much
			// distortion there is
			var vertex 	= vertices[vCount],
				// Math.floor((((vertex.origPos.y + 240)%200) * divisor) * audioDataLength)
				marker	= vertex.audioMapping["y"],
				amount	= audioData[marker] * vars["sensitivity"],
				push 	= vertex.origPosNorm.clone().multiplyScalar(amount);

			// if the distortion is greater
			// than our threshold
			if(amount > vars["particleThreshold"])
			{
				// create a new particle!
				var particle 		= new THREE.Vertex(vertex.position.clone()),
					pColor			= new THREE.Color(0);
				
				// colour it and set it
				// up in line with the vertex
				pColor.setHSV(hue,1,1);
				pColor.updateRGB();
				
				particle.velocity 			= push.clone().multiplyScalar(.1 + Math.random());
				particles.vertices[vMarker] = particle;
				particles.colors[vMarker] 	= pColor;
				
				vMarker++;
				vMarker %= particles.vertices.length;
			}
			
			// push out the vertex
			vertex.velocity.addSelf(push);
		}
		
	};
	
	/**
	 * Simple embed Flash call
	 */
	function embedFlash()
	{
		swfobject.embedSWF("swf/audiomesh.swf", "flashcontent", "330", "200", "10.2.0", "swf/expressInstall.swf", null, {allowScriptAccess: "always",wmode:"transparent",width:"330",height:"200"}, null, embedded);
	}
	
	/**
	 * Callback for Flash embed
	 */
	function embedded(e)
	{
		if(!e.success)
		{
			flashContainer.className = "error";
		}
	}
	
	/**
	 * Creates the objects we need
	 */
	function createObjects()
	{
		// set up our vars
		var path 	= "images/pisa/",
			format 	= '.png',
			urls 	= [
				path + 'px' + format, path + 'nx' + format,
				path + 'py' + format, path + 'ny' + format,
				path + 'pz' + format, path + 'nz' + format
			],
			textureCube 				= ImageUtils.loadTextureCube( urls ),
			icoBase						= new THREE.MeshLambertMaterial({color: 0xFFFFFF, envMap: textureCube, shading: THREE.SmoothShading}),
			icoShadow					= new THREE.MeshBasicMaterial({color: 0xFFFFFF, map:ImageUtils.loadTexture("images/shadow.png"), blending: THREE.BillboardBlending}),
			spotlightMat				= new THREE.MeshBasicMaterial({map:ImageUtils.loadTexture("images/spotlight.png"), blending: THREE.BillboardBlending}),
			particleMat					= new THREE.ParticleBasicMaterial( { color:0xFFFFFF, blending: THREE.BillboardBlending, map: ImageUtils.loadTexture("images/particle.png"), size: 10, opacity: .9, vertexColors:true, sizeAttenuation:true } );
		
		// create the actual objects we need
		ico 							= new THREE.Mesh(new Sphere(1,32,32), icoBase);
		shadow							= new THREE.Mesh(new Plane(512,512,1), icoShadow);
		spotlight						= new THREE.Mesh(new Plane(512,512,8,8), spotlightMat);
		
		// set up the particle system
		particles						= new THREE.Geometry();
		particleSystem					= new THREE.ParticleSystem(particles, particleMat);
		particleSystem.sortParticles 	= true;
		
		// the shadow
		shadow.position.y				= -320;
		shadow.rotation.x				= -Math.PI * .5;
		
		// and the spotlight
		spotlight.position.y			= -321;
		spotlight.rotation.x			= -Math.PI * .5;
		
		// now create 2,000 placeholder particles
		for(var i = 0; i < 2000; i ++)
		{
			var pPos = new THREE.Vector3(0,5000,0);
			particles.vertices.push(new THREE.Vertex(pPos));
			particles.colors.push(new THREE.Color(0xFFFFFF));
			particles.vertices[i].velocity 	= new THREE.Vector3();
		}
		
		// cache a reference to make it easier
		vertices				= ico.geometry.vertices;
		var vertCount			= vertices.length,
			audioDataLength		= 15,
			divisor				= 1/240;
		
		// now go through each vertex and
		// set up the audio mapping and 
		// position information
		while(vertCount--)
		{
			var vertex			= vertices[vertCount];
			vertex.position.multiplyScalar(100);
			
			vertex.origPos 		= vertices[vertCount].position.clone();
			vertex.origPosNorm 	= vertices[vertCount].position.clone().normalize();
			vertex.velocity		= new THREE.Vector3();
			vertex.acceleration	= new THREE.Vector3();
			vertex.audioMapping = {
				"y": Math.floor((((vertex.origPos.y + 240)%200) * divisor) * audioDataLength),
				"random": Math.round(Math.random() * audioDataLength)
			};
		}

		// whack them in the scene
		scene.addChild(shadow);
		scene.addChild(spotlight);
		scene.addChild(ico);
		scene.addChild(particleSystem);
	}
	
	/**
	 * Creates the WebGL renderer
	 */
	function createRenderer()
	{
		renderer 					= new THREE.WebGLRenderer();
		camera 						= new THREE.Camera(45, width / height, NEAR, FAR);
		scene 						= new THREE.Scene();
	
	    // position the camera
	    camera.position.z			= 400;
	    
	    // start the renderer
	    renderer.setSize(width, height);
	    $container.append(renderer.domElement);
	}
	
	/**
	 * Sets up the event listeners for DnD, the GUI
	 * and window resize
	 */
	function addEventListeners()
	{
		// window event
		$(window).resize(callbacks.windowResize);
		
		// GUI events
		$(".gui-set a").click(callbacks.guiClick);
		$(".gui-set a.default").trigger('click');
	}
	
	/**
	 * Updates the velocity and position
	 * of the particles in the view
	 */
	function update()
	{
		if(mode == WEBGL_MODE)
		{
			// spin the camera
			if(orbitCamera)
			{
				camera.position.x 	= Math.sin(orbitValue) * DEPTH;
				camera.position.y 	= 90 + Math.sin(orbitValue) * 80;
				camera.position.z 	= Math.cos(orbitValue) * DEPTH;
				orbitValue 			+= vars["orbitSpeed"];
			}

			// now have each vertex return to base
			var vCount 	= vertices.length,
				pCount	= particles.vertices.length,
				minX	= 0,
				maxX	= 0;
			
			while(vCount--)
			{
				var vertex			= vertices[vCount],
					dist			= vertex.position.distanceTo(vertex.origPos),
					force			= -dist * .1,
					acceleration	= (new THREE.Vector3())
									.sub(vertex.position,vertex.origPos)
									.normalize()
									.multiplyScalar(force);
				
				// numerically integrate
				vertex.velocity.addSelf(acceleration);
				vertex.position.addSelf(vertex.velocity);
				
				// track the vals so we can
				// scale the shadow as needed
				if(vertex.position.x < minX) {
					minX = vertex.position.x;
				}
				
				if(vertex.position.x > maxX) {
					maxX = vertex.position.x;
				}
				
				// if we have the sin wave on
				if(sinWave)
				{
					// calculate this vertex's offset due to the sin wave
					var vertSinVal 	= Math.sin((vertex.origPos.y + sinVal) * .1) * 3,
						waveVector	= vertex.origPosNorm.clone();
					
					waveVector.y 	= 0;
					
					// add it on to the position
					vertex.position.addSelf(waveVector.multiplyScalar(vertSinVal));
					
				}
				
				// slow down the vertex's velocity
				vertex.velocity.multiplyScalar(DAMPEN);
			}
			
			// go through each particle
			while(pCount--)
			{
				var particle = particles.vertices[pCount];
				var color	 = particles.colors[pCount];
				
				if(particle)
				{
					// fly it upwards
					particle.velocity.y += 0.05;
					particle.position.addSelf(particle.velocity);
					
					// fade to white
					color.r += (1 - color.r) * .01;
					color.g += (1 - color.g) * .01;
					color.b += (1 - color.b) * .01;
					
				}
			}
			
			// now scale the shadow
			var shadowScale = (maxX-minX)/200;
			shadow.scale = new THREE.Vector3(shadowScale, shadowScale, shadowScale);
			
			// increase the sin value
			sinVal += SIN_RATE;

			// update the spotlight and main mesh colours
			spotlight.materials[0].color.setHSV(hue, .9,1);
			ico.materials[0].color.setHSV(hue,.9,1);
			
			// finally flag that the sphere has changed
			ico.geometry.__dirtyVertices = true;
		}
		
		// update the hue
		hue += HUE_RATE;
		hue %= 1;
		
		// set up a request for a render
		requestAnimationFrame(render);
	}
	
	/**
	 * Renders the current state
	 */
	function render()
	{
		// only render
		if(renderer) {
			renderer.render(scene, camera);
		}
		
		// set up the next frame
		update();
	}
	
	/**
	 * Our internal callbacks object - a neat
	 * and tidy way to organise the various
	 * callbacks in operation.
	 */
	callbacks = {
		guiClick:function() {
			var $this 	= $(this),
				varName	= $this.data("guivar"),
				varVal	= $this.data("guival");
			if(vars[varName] !== null) {
				vars[varName] = varVal;
			}
			
			$this.siblings().addClass('disabled');
			$this.removeClass('disabled');
			
			return false;
		},
		windowResize: function() {
			
			if(mode == WEBGL_MODE && camera)
			{
				WIDTH			= $container.width() - 15,
				HEIGHT			= $container.height() - 15,
				camera.aspect 	= WIDTH / HEIGHT,
				renderer.setSize(WIDTH, HEIGHT);
			
				camera.updateProjectionMatrix();
			}
		}
	};
};

// Deform to audio...? I think so.
$(document).ready(function(){
	
	if(Modernizr.webgl) {
		// Go!
		AEROTWIST.AudioMesh.init();
	}
});