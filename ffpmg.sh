#!/bin/bash
# Compile and install/update (or install via Apt) FFmpeg Codecs
# Compile and install/update FFmpeg suite
# Compile with hardware acceleration
# Modified from https://retroresolution.com/compiling-ffmpeg-from-source-code-all-in-one-script/

echo "Begining Installation of FFmpeg Suite"

#Update APT Repository
echo "Updating the APT repository information"
sudo apt-get update

#Create Working Directories
echo "Setting up working directories to be used during the installation and build process"
cd ~
rm -rf ~/ffmpeg_build ~/ffmpeg_sources ~/bin/{ffmpeg,ffprobe,ffplay,ffserver,x264,x265}
mkdir -p ~/ffmpeg_sources
mkdir -p ~/ffmpeg_build

#Build Tools
echo "Installing various tools and packages, including audio-video codecs, required for building FFmpeg"
sudo apt-get -y install \
  autoconf \
  automake \
  build-essential \
  git \
  pkg-config \
  texinfo \
  wget \
  yasm \
  libavdevice-dev \
  frei0r-plugins-dev \
  ladspa-sdk \
  libass-dev \
  libavc1394-dev \
  libavresample-dev \
  libbluray-dev \
  libbs2b-dev \
  libcaca-dev \
  libcdio-dev \
  libcelt-dev \
  libchromaprint-dev \
  libdrm-dev \
  libfdk-aac-dev \
  flite1-dev \
  libfontconfig1-dev \
  libfreetype6-dev \
  libfrei0r-ocaml-dev \
  libfribidi-dev \
  libgme-dev \
  libgsm1-dev \
  libiec61883-dev \
  libjack-dev \
  libkvazaar-dev \
  libladspa-ocaml-dev \
  libmodplug-dev \
  libmp3lame-dev \
  libmp3lame-dev \
  libopencore-amrnb-dev \
  libopencore-amrwb-dev \
  libopencv-dev \
  libopenh264-dev \
  libopenjpeg-dev \
  libopenmpt-dev \
  libopus-dev \
  libopus-dev \
  libpulse-dev \
  librsvg2-dev \
  librtmp-dev \
  librubberband-dev \
  libsdl2-dev \
  libshine-dev \
  libsmbclient-dev \
  libsnappy-dev \
  libsoxr-dev \
  libspeex-dev \
  libssh-dev \
  libtesseract-dev \
  libtheora-dev \
  libtheora-dev \
  libtool \
  libtwolame-dev \
  libv4l-dev \
  libva-dev \
  libvdpau-dev \
  libvidstab-dev \
  libvo-amrwbenc-dev \
  libvorbis-dev \
  libvorbis-dev \
  libvpx-dev \
  libvpx-dev \
  libwavpack-dev \
  libwebp-dev \
  libx264-dev \
  libx264-dev \
  libx265-dev \
  libx265-dev \
  libxcb1-dev \
  libxcb-shape0-dev \
  libxcb-shm0-dev \
  libxcb-xfixes0-dev \
  libxml2-dev \
  libxvidcore-dev \
  libzimg-dev \
  libzmq-dev \
  libzvbi-dev \
  libopenal-dev \
  libssl1.0-dev \
  zlib1g-dev

cd ~/ffmpeg_sources
wget http://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 -O ffmpeg-snapshot.tar.bz2
tar xjvf ffmpeg-snapshot.tar.bz2
cd ffmpeg

echo "Configuring FFmpeg"
PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
  --prefix="$HOME/ffmpeg_build" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$HOME/ffmpeg_build/include" \
  --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
  --extra-libs="-lpthread -lm" \
  --bindir="$HOME/bin" \
  --enable-gpl \
  --enable-nonfree \
  --enable-version3 \
  --enable-avresample \
  --enable-omx \
  --enable-omx-rpi \
  --enable-mmal \
  --enable-avisynth \
  --enable-chromaprint \
  --enable-frei0r \
  --enable-ladspa \
  --enable-libass \
  --enable-libbluray \
  --enable-libbs2b \
  --enable-libcaca \
  --enable-libcelt \
  --enable-libcdio \
  --enable-libdc1394 \
  --enable-libfdk-aac \
  --enable-libflite \
  --enable-libfontconfig \
  --enable-libfreetype \
  --enable-libfribidi \
  --enable-libgme \
  --enable-libgsm \
  --enable-libiec61883 \
  --enable-libjack \
  --enable-libkvazaar \
  --enable-libmodplug \
  --enable-libmp3lame \
  --enable-libopencore-amrnb \
  --enable-libopencore-amrwb \
  --enable-libopencv \
  --enable-libopenh264 \
  --enable-libopenjpeg \
  --enable-libopenmpt \
  --enable-libopus \
  --enable-libpulse \
  --enable-librsvg \
  --enable-librubberband \
  --enable-librtmp \
  --enable-libshine \
  --enable-libsmbclient \
  --enable-libsnappy \
  --enable-libsoxr \
  --enable-libspeex \
  --enable-libssh \
  --enable-libtesseract \
  --enable-libtheora \
  --enable-libtwolame \
  --enable-libv4l2 \
  --enable-libvidstab \
  --enable-libvmaf \
  --enable-libvo-amrwbenc \
  --enable-libvorbis \
  --enable-libvpx \
  --enable-libwavpack \
  --enable-libwebp \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libxavs \
  --enable-libxcb \
  --enable-libxcb-shm \
  --enable-libxcb-xfixes \
  --enable-libxcb-shape \
  --enable-libxvid \
  --enable-libxml2 \
  --enable-libzimg \
  --enable-libzmq \
  --enable-libzvbi \
  --enable-libdrm \
  --enable-openssl \
  --enable-openal \
  --enable-opengl

echo "Making FFmpeg"
PATH="$HOME/bin:$PATH" make -j4
make install
hash -r

#Update Shared Library Cache
echo "Updating Shared Library Cache"
sudo ldconfig

echo "FFmpeg and Codec Installation Complete"