
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { MapDirectionsRenderer, MapDirectionsService } from "@angular/google-maps";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Rota, ValoresParaOcultar } from '../utils'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  //#region Campos
  zoom = 12;

  localizacaoOrigem: google.maps.LatLngLiteral;
  localizacaoDestino: google.maps.LatLngLiteral;

  distancia?: string = '0'
  duracao?: string = '0'
  @ViewChild('modalEntradaDeDados', { static: true })
  modalEntradaDeDados?: ElementRef;

  @ViewChild('modalSaidaDeDados', { static: true })
  modalSaidadaDeDados?: ElementRef;

  center: google.maps.LatLngLiteral = {
    lat: -12.257377,
    lng: -38.961352
  };

  optionsMap: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
  };

  optionsAutoComplete: google.maps.places.AutocompleteOptions = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
  };

  directionsResults?: Observable<google.maps.DirectionsResult | undefined>;

  @ViewChild("INPUT_DESTINO", { static: true })
  inputDestino?: ElementRef;
  @ViewChild("INPUT_ORIGEM", { static: true })
  inputOrigem?: ElementRef;

  //#endregion
  //#region Funções do ambiente
  constructor(private readonly mapDirectionService: MapDirectionsService) {
    this.localizacaoDestino = { lat: 0, lng: 0 }
    this.localizacaoOrigem = { lat: 0, lng: 0 }
  }

  ngOnInit() {
    const origem: google.maps.places.Autocomplete = new google.maps.places.Autocomplete(this.inputOrigem!.nativeElement, this.optionsAutoComplete);
    const destino: google.maps.places.Autocomplete = new google.maps.places.Autocomplete(this.inputDestino!.nativeElement, this.optionsAutoComplete);

    this.AdicionarOuvinte(origem, Rota.Origem);
    this.AdicionarOuvinte(destino, Rota.Destino);
  }
  //#endregion
  //#region Funções próprias
  TracarRota() {
    const request: google.maps.DirectionsRequest = {
      origin: this.localizacaoOrigem,
      destination: this.localizacaoDestino,
      travelMode: google.maps.TravelMode.DRIVING,
      language: "pt-BR"
    };

    this.directionsResults = this.mapDirectionService.route(request).pipe(map(response => response.result));
    this.directionsResults.subscribe(res => {
      this.distancia = res?.routes[0].legs[0].distance?.text;
      this.duracao = res?.routes[0].legs[0].duration?.text
    })
    this.OcultarModalEntradaDeDados();
    this.ExibirModalSaidaDeDados();
  }

  AdicionarOuvinte(autoComplete: google.maps.places.Autocomplete, rota: Rota): void {
    autoComplete.addListener("place_changed", () => {
      const place = autoComplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      const lugar = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }

      if (rota == Rota.Destino)
        this.localizacaoDestino = lugar
      else if (rota == Rota.Origem)
        this.localizacaoOrigem = lugar
    });
  }

  UsarRotaAtualComoOrigem() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.localizacaoOrigem = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      (<HTMLInputElement>this.inputOrigem!.nativeElement).value = "Usando a posição atual como origem";
    });
  }

  //#endregion
  //#region modal entrada de dados
  ManipularModalEntradaDeDados() {
    if (this.modalEntradaDeDados!.nativeElement.style.left == ValoresParaOcultar.ModalDeEntradaDados)
      this.ExibirModalEntradaDeDados()
    else
      this.OcultarModalEntradaDeDados();
  }

  ExibirModalEntradaDeDados() { this.modalEntradaDeDados!.nativeElement.style.left = '0px'; }

  OcultarModalEntradaDeDados() { this.modalEntradaDeDados!.nativeElement.style.left = ValoresParaOcultar.ModalDeEntradaDados; }
  //#endregion
  //#region modal de saida de Dados

  ManipularModalSaidaDeDados() {
    if (this.modalSaidadaDeDados!.nativeElement.style.bottom == ValoresParaOcultar.ModalDeSaidaDeDados)
      this.ExibirModalSaidaDeDados()
    else
      this.OcultarModalSaidaDeDados();
  }

  ExibirModalSaidaDeDados() { this.modalSaidadaDeDados!.nativeElement.style.bottom = '0px'; }

  OcultarModalSaidaDeDados() { this.modalSaidadaDeDados!.nativeElement.style.bottom = ValoresParaOcultar.ModalDeSaidaDeDados; }
  //#endregion
}