import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class FirebaseCallerService {

  constructor(private db: AngularFirestore) { }

  public getCollection(listPath): Observable<any[]> {
    return this.db.collection(listPath).valueChanges();
  }

  public addItemToCollection(listPath, item): any {
    return this.db.collection(listPath).add(item)
    .catch(function(error) {
      console.error('Error', error);
    });
  }
}
