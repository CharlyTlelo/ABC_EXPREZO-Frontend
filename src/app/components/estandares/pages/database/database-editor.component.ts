import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Componente para editar y visualizar diagramas de base de datos utilizando draw.io.
 */
@Component({
  selector: 'app-database-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './database-editor.component.html',
  styleUrls: ['./database-editor.component.scss']
})
export class DatabaseEditorComponent {
  @ViewChild('drawio') drawioRef!: ElementRef<HTMLIFrameElement>;
  drawIoUrl: SafeResourceUrl;
  private isBrowser = false;

  private initialXml =
    '<mxfile host="embed.diagrams.net"><diagram name="DB Model"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>';

  private lastXml: string | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private s: DomSanitizer) {
    this.isBrowser = isPlatformBrowser(platformId);
    const url = 'https://embed.diagrams.net/?embed=1&ui=min&proto=json&spin=1&lang=es&libraries=general;flowchart;uml;bpmn;er';
    this.drawIoUrl = this.s.bypassSecurityTrustResourceUrl(url);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    window.addEventListener('message', this.onMessage as any);
  }
  ngOnDestroy() {
    if (!this.isBrowser) return;
    window.removeEventListener('message', this.onMessage as any);
  }

  private onMessage = (evt: MessageEvent) => {
    if (!evt?.data) return;
    let msg: any;
    try { msg = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data; } catch { return; }

    switch (msg.event) {
      case 'init':
        this.postToEditor({ action: 'load', xml: this.initialXml });
        break;
      case 'save':
        if (msg.xml) {
          this.lastXml = msg.xml;
          this.downloadFile('diagram.drawio', msg.xml, 'text/xml');
        }
        break;
      case 'export':
        if (msg.data) {
          this.downloadDataUri(`diagram.${msg.format || 'png'}`, msg.data);
        }
        break;
    }
  };

  /** Crea un nuevo diagrama vacío */
  createNewDiagram() {
    this.postToEditor({ action: 'load', xml: this.initialXml });
  }
  /** Carga un archivo .drawio o .xml del usuario */
  loadFromFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const xml = String(reader.result || '');
      this.postToEditor({ action: 'load', xml });
    };
    reader.readAsText(file);
    (event.target as HTMLInputElement).value = '';
  }
  /** Solicita al editor exportar el diagrama en el formato especificado */
  requestExport(format: 'xml' | 'png' | 'svg') {
    if (!this.isBrowser) return;
    if (format === 'xml') { this.postToEditor({ action: 'save' }); return; }
    this.postToEditor({ action: 'export', format, scale: 1, border: 0, transparent: true });
  }

  private postToEditor(payload: any) {
    this.drawioRef?.nativeElement?.contentWindow?.postMessage(JSON.stringify(payload), '*');
  }
  private downloadDataUri(filename: string, dataUri: string) {
    const a = document.createElement('a');
    a.href = dataUri; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  }
  private downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    this.downloadDataUri(filename, url);
    URL.revokeObjectURL(url);
  }
}