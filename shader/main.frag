precision highp float;

float PI=3.14159265358979;
float TAU=6.283185306;

varying vec2 vTexCoord;

uniform float u_time;
uniform sampler2D u_mainTex;
uniform sampler2D u_frameTex;

uniform bool u_isEffect0;
uniform bool u_isEffect1;
uniform bool u_isEffect2;
uniform bool u_isEffect3;
uniform bool u_isEffect4;
uniform bool u_isEffect5;
uniform bool u_isEffect6;
uniform bool u_isEffect7;

float map(float value, float min1, float max1, float min2, float max2){
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

vec2 fade(vec2 t){
    return t*t*t*(t*(t*6.-15.)+10.);
}

float perlinNoise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);

    // 4つの頂点での勾配を計算
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));

    // フェード関数を適用
    vec2 u=fade(f);

    // バイリニア補間
    return mix(
        mix(a,b,u.x),
        mix(c,d,u.x),
        u.y
    );
}

mat2 rot(float angle){
    return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

float atan2(float y,float x){
    return x==0.?sign(y)*PI/2.:atan(y,x);
}

vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.y,xy.x),length(xy));
}

vec2 pol2xy(vec2 pol){
    return pol.y*vec2(cos(pol.x),sin(pol.x));
}

vec2 mirror(vec2 uv){
    return vec2(abs(uv.x-0.5),uv.y);
}

vec2 mosaic(vec2 uv, float n){
    return floor(uv*n)/n;
}

vec4 monochrome(vec4 col){
    return vec4(vec3(col.r+col.g+col.b)/3.,col.a);
}

vec4 binary(vec4 col){
    return vec4(floor(col.rgb+0.99),col.a);
}

vec4 invert(vec4 col){
    return vec4((1.)-col.rgb,col.a);
}

vec4 posterization(vec4 col, float n){
    return vec4(floor(col.rgb*(n+0.5))/n, col.a);
}

vec4 vignette(vec4 col,vec2 uv,float radius,float softness){
    float dist=distance(uv,vec2(.5));
    float vignette=smoothstep(radius,radius-softness,dist);
    return col*vec4(vec3(1.-vignette),1.);
}

vec4 strobe(vec4 col){
    return vec4(1.0);
}

vec4 rgbShift(vec4 col,vec2 uv,float scale,sampler2D tex){
    // 赤のチャンネルをスケール
    vec2 redUV=(uv-.5)*(1.0+scale)+.5;
    vec4 redChannel=texture2D(tex,redUV);

    // 他のチャンネルはそのまま
    vec4 greenChannel=texture2D(tex,uv);
    vec4 blueChannel=texture2D(tex,uv);

    return vec4(redChannel.r,greenChannel.g,blueChannel.b,col.a);
}

vec2 tile(vec2 uv,float n){
    return fract(uv*n);
}

vec4 veryCrop(vec4 col, vec2 uv){
    return abs(uv.y - 0.5) < 0.03 ? col : vec4(0.0);
}

void main(void){
    vec2 p=vTexCoord;

    if(u_isEffect0)p=tile(p,4.);
    if(u_isEffect1)p=mosaic(p,100.);
    if(u_isEffect2)p=mirror(p);

    vec4 mainTexCol=texture2D(u_mainTex,p);

    vec4 col= mainTexCol+texture2D(u_frameTex,vTexCoord);

    if(u_isEffect3) col=posterization(col,8.);
    if(u_isEffect4) col=invert(col);
    if(u_isEffect5) col=monochrome(col);
    if(u_isEffect6) col=rgbShift(col,vTexCoord,0.01,u_mainTex);
    if(u_isEffect7) col=veryCrop(col,vTexCoord);

    gl_FragColor=col;
}