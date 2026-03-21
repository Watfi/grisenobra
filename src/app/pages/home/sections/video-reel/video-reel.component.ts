import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-video-reel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './video-reel.component.html',
})
export class VideoReelComponent {
  col1 = ['/mp4/video1.mp4', '/mp4/video2.mp4', '/mp4/video3.mp4'];
  col2 = ['/mp4/video2.mp4', '/mp4/video3.mp4', '/mp4/video1.mp4'];
  col3 = ['/mp4/video3.mp4', '/mp4/video1.mp4', '/mp4/video2.mp4'];
  col4 = ['/mp4/video1.mp4', '/mp4/video3.mp4', '/mp4/video2.mp4'];
}
